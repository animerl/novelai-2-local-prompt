import re


def convert(prompt):
    re_attention = re.compile(r'\{|\[|}|]|[^{}\[\]]+', re.MULTILINE | re.UNICODE)
    re_brackets = re.compile(r'\\{2,}([()])', re.IGNORECASE | re.MULTILINE)
    text = prompt.replace('(', '\\(').replace(')', '\\)')
    text = re.sub(re_brackets, '\\1', text, 0)

    res = []
    curly_brackets = []
    square_brackets = []
    curly_bracket_multiplier = 1.05
    square_bracket_multiplier = 1 / 1.05

    def multiply_range(start_position, multiplier):
        for pos in range(start_position, len(res)):
            res[pos][1] = res[pos][1] * multiplier

    for match in re_attention.finditer(text):
        word = match.group(0)
        if word == "{":
            curly_brackets.append(len(res))
        elif word == "[":
            square_brackets.append(len(res))
        elif word == "}" and len(curly_brackets) > 0:
            multiply_range(curly_brackets.pop(), curly_bracket_multiplier)
        elif word == "]" and len(square_brackets) > 0:
            multiply_range(square_brackets.pop(), square_bracket_multiplier)
        else:
            res.append([word, 1.0])

    for pos in curly_brackets:
        multiply_range(pos, curly_bracket_multiplier)

    for pos in square_brackets:
        multiply_range(pos, square_bracket_multiplier)

    if len(res) == 0:
        res = [["", 1.0]]

    # merge runs of identical weights
    i = 0
    while i + 1 < len(res):
        if res[i][1] == res[i + 1][1]:
            res[i][0] = res[i][0] + res[i + 1][0]
            res.pop(i + 1)
        else:
            i += 1

    result = ""
    for i in range(len(res)):
        if res[i][1] == 1.0:
            result += res[i][0]
        else:
            result += "(" + res[i][0] + ":" + str(res[i][1]) + ")"

    # Add prefix
    if 'masterpiece, best quality,' not in result:
        result = 'masterpiece, best quality, ' + result

    return result.replace('_', ' ')
