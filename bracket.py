# Check bracket consistency of input string
text=input()
def check_bracket(text):
    stack = []
    for i in range(len(text)):
        if text[i] == '{' or text[i] == '[' or text[i] == '(':
            stack.append(text[i])
        elif text[i] == '}' or text[i] == ']' or text[i] == ')':
            if len(stack) == 0:
                return False
            else:
                top = stack.pop()
                if not match(top, text[i]):
                    return False
    if len(stack) != 0:
        return False
    return True

def match(top, character):
    if top == '{' and character == '}':
        return True
    elif top == '[' and character == ']':
        return True
    elif top == '(' and character == ')':
        return True
    else:
        return False
    
if check_bracket(text)==True:
    print("Brackets are balanced.")
else:
    print("Bracket are not balanced. Stop processing.")