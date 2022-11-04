// Thanks to the 5ch user who wrote the original script.
// Original ID:8+9FG8Jy0, Improved Script https://rentry.org/43zdr
// nan-J NovelAI Club

// Maximum number of histories will be kept
const MaxHistory = 10;
// History of positive prompt
let historyBox = (function () {
  let _historyBox = [];

  return {
    push: function (prompt) {
      if (prompt == _historyBox[_historyBox.length - 1]) return;
      _historyBox.push(prompt);
      if (MaxHistory < _historyBox.length) {
        _historyBox.shift();
      }
    },
    pop: function () {
      let prePrompt = _historyBox.pop();
      return prePrompt;
    },
  };
})();
// History of negative prompt
let nhistoryBox = (function () {
  let _historyBox = [];

  return {
    push: function (prompt) {
      if (prompt == _historyBox[_historyBox.length - 1]) return;
      _historyBox.push(prompt);
      if (MaxHistory < _historyBox.length) {
        _historyBox.shift();
      }
    },
    pop: function () {
      let prePrompt = _historyBox.pop();
      return prePrompt;
    },
  };
})();
// Round function
function round(value) {
  return Math.round(value * 10000) / 10000;
}
function convert(input) {
  const re_attention = /\{|\[|\}|\]|[^\{\}\[\]]+/gmu;
  let text = input.replaceAll("(", "\\(").replaceAll(")", "\\)");

  let res = [];

  let curly_brackets = [];
  let square_brackets = [];

  const curly_bracket_multiplier = 1.05;
  const square_bracket_multiplier = 1 / 1.05;

  function multiply_range(start_position, multiplier) {
    for (let pos = start_position; pos < res.length; pos++) {
      res[pos][1] = round(res[pos][1] * multiplier);
    }
  }

  for (const match of text.matchAll(re_attention)) {
    let word = match[0];

    if (word == "{") {
      curly_brackets.push(res.length);
    } else if (word == "[") {
      square_brackets.push(res.length);
    } else if (word == "}" && curly_brackets.length > 0) {
      multiply_range(curly_brackets.pop(), curly_bracket_multiplier);
    } else if (word == "]" && square_brackets.length > 0) {
      multiply_range(square_brackets.pop(), square_bracket_multiplier);
    } else {
      res.push([word, 1.0]);
    }
  }

  for (const pos of curly_brackets) {
    multiply_range(pos, curly_bracket_multiplier);
  }

  for (const pos of square_brackets) {
    multiply_range(pos, square_bracket_multiplier);
  }

  if (res.length == 0) {
    res = [["", 1.0]];
  }

  // console.log(res);
  // merge runs of identical weights
  let i = 0;
  while (i + 1 < res.length) {
    // console.log("test:" + res[i] + " : " + res[i+1])
    if (res[i][1] == res[i + 1][1]) {
      res[i][0] = res[i][0] + res[i + 1][0];
      // console.log("splicing:" + res[i+1]);
      res.splice(i + 1, 1);
    } else {
      i += 1;
    }
  }
  // console.log(res);

  let result = "";
  for (let i = 0; i < res.length; i++) {
    if (res[i][1] == 1.0) {
      result += res[i][0];
    } else {
      result += "(" + res[i][0] + ":" + res[i][1].toString() + ")";
    }
  }
  return result;
}

function onClickConvert() {
  const default_prompt = "masterpiece, best quality,\n";
  const default_negative =
    "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, artist name";

  let result = "";
  let prompt = gradioApp().querySelector("#txt2img_prompt > label > textarea");
  historyBox.push(prompt.value);
  result = convert(prompt.value);
  if (result.length != 0) {
    if (result.match(/^masterpiece, best quality,/) == null) {
      result = default_prompt + result;
    }
  }
  prompt.value = result;
  prompt.dispatchEvent(new Event("input", { bubbles: true }));

  result = "";
  let negprompt = gradioApp().querySelector(
    "#txt2img_neg_prompt > label > textarea"
  );
  nhistoryBox.push(negprompt.value);
  result = convert(negprompt.value);
  if (result.length != 0) {
    if (result.match(/^lowres,/) == null) {
      result = default_negative + ",\n" + result;
    }
  } else {
    result = default_negative;
  }
  negprompt.value = result;
  negprompt.dispatchEvent(new Event("input", { bubbles: true }));
}

function onClickGenerate() {
  let prompt = gradioApp().querySelector("#txt2img_prompt > label > textarea");
  historyBox.push(prompt.value);
  let negprompt = gradioApp().querySelector(
    "#txt2img_neg_prompt > label > textarea"
  );
  nhistoryBox.push(negprompt.value);
}

function onClickUndo() {
  let prompt = gradioApp().querySelector("#txt2img_prompt > label > textarea");
  let prePrompt = historyBox.pop();

  if (!prePrompt) {
    prompt.value = "";
  } else {
    prompt.value = prePrompt;
  }
  prompt.dispatchEvent(new Event("input", { bubbles: true }));

  let negprompt = gradioApp().querySelector(
    "#txt2img_neg_prompt > label > textarea"
  );
  let prenegprompt = nhistoryBox.pop();

  if (!prenegprompt) {
    negprompt.value = "";
  } else {
    negprompt.value = prenegprompt;
  }
  negprompt.dispatchEvent(new Event("input", { bubbles: true }));
}

onUiUpdate(function () {
  let parentArea = gradioApp().querySelector("#toprow");
  let generateBtn = gradioApp().querySelector("#txt2img_generate");
  let beforeElement = gradioApp().querySelector("#roll_col");

  if (parentArea == null || generateBtn == null || beforeElement == null)
    return;
  if (gradioApp().querySelector("#nai2local") != null) return;

  generateBtn.addEventListener("click", onClickGenerate);

  let nai2LocalArea = document.createElement("div");
  nai2LocalArea.id = "nai2local";
  nai2LocalArea.className = "overflow-hidden flex flex-col relative col gap-4";
  nai2LocalArea.style =
    "min-width: min(110px, 100%); max-width: 120px; flex-grow: 1; padding: 0em; padding-top: 0.4em;";

  let convertBtn = document.createElement("button");
  convertBtn.id = "nai2localconvert";
  convertBtn.type = "button";
  convertBtn.innerHTML = "NAIConvert";
  convertBtn.className = "gr-button gr-button-lg gr-button-secondary";
  convertBtn.style =
    "padding-left: 0.1em; padding-right: 0em; margin: 0.1em 0;max-height: 2em; max-width: 6em";
  convertBtn.addEventListener("click", onClickConvert);
  nai2LocalArea.appendChild(convertBtn);

  let undoBtn = document.createElement("button");
  undoBtn.id = "nai2localUndo";
  undoBtn.type = "button";
  undoBtn.innerHTML = "History";
  undoBtn.className = "gr-button gr-button-lg gr-button-secondary";
  undoBtn.style =
    "padding-left: 0.1em; padding-right: 0em; margin: 0.1em 0;max-height: 2em; max-width: 6em";
  undoBtn.addEventListener("click", onClickUndo);
  nai2LocalArea.appendChild(undoBtn);

  parentArea.insertBefore(nai2LocalArea, beforeElement.nextSibling);
});
