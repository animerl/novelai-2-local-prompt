# novelai-2-local-prompt
Script for Stable-Diffusion WebUI (AUTOMATIC1111) to convert the prompt format used by NovelAI.  
[English](#en)  [日本語](#ja)
# Credits
https://rentry.org/43zdr  
https://github.com/naisd5ch/novel-ai-5ch-wiki-js  
nan-J NovelAI club
# en
## INSTALL
Put `nai2local.js` into your `stable-diffusion-webui/javascript`
## Usage
<img width="201" src="https://user-images.githubusercontent.com/113022648/197382468-65f4a96d-48af-4890-8fcf-0ec7c3b9ec3a.png">
Simply click on `NAIConvert`.
It will automatically process the brackets, prefix them with a quality tag, and insert a default value in the negative prompt.
Multipliers are rounded off to four decimal places.

```
(a),{b},[c]
↓NAIConvert
masterpiece, best quality,
\(a\),(b:1.05),(c:0.9524)
```
Click `History` to call back previously generated prompts, starting with the newest. The default maximum number of saves is 10(`MaxHistory`).
# ja
## INSTALL
`nai2local.js`を`stable-diffusion-webui/javascript`に入れてください。
##
<img width="201" src="https://user-images.githubusercontent.com/113022648/197382468-65f4a96d-48af-4890-8fcf-0ec7c3b9ec3a.png">

`NAIConvert`をクリックすると、自動で括弧が処理され、quality tagが追加され、ネガティブプロンプトにNovelAIが利用しているものが自動で追加されます。
ワードに対して適用される倍数は、小数点以下4桁で丸めています。

```
(a),{b},[c]
↓NAIConvert
masterpiece, best quality,
\(a\),(b:1.05),(c:0.9524)
```
`History`をクリックすると、前に生成したプロンプトを新しいものから順に呼び出します。最大保存数はデフォルトで10です(`MaxHistory`)
