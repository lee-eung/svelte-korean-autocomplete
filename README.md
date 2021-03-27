# Svelte로 한글 검색어 자동완성 구현하기

Svelte로 구현된 검색어 자동완성(autocomplete) 관련 자료를 찾아보면, 다음과 같은 것들이 나옵니다.
- <a href="https://github.com/elcobvg/svelte-autocomplete" target="_blank">svelte-autocomplete</a>
- <a href="https://github.com/pstanoev/simple-svelte-autocomplete" target="_blank">Simple Svelte Autocomplete</a>
- <a href="https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0" target="_blank">MultiSelect • REPL • Svelte</a>
- <a href="https://metonym.github.io/svelte-typeahead/" target="_blank">svelte-typeahead</a>

알파벳으로 이루어진 단어 검색을 위한 거라면 그냥 얘네들 중 하나를 골라 쓰면 될텐데요. 한글 검색어를 대상으로 자동완성을 구현하려면, 한글의 초성/중성/종성을 처리해주는 로직이 필요합니다.

물론 알파벳 자동완성 로직에서도 한글 검색어 자동완성이 미흡하나마 되긴 합니다만, 한글 검색어 입력할 때 아직 음절이 되지 못하고 음소 상태로 있을 땐 검색 결과가 항상 0으로 나오는 문제가 있습니다.

<a href="https://bluewings.github.io/unobstructed-hangul-regular-expression/" target="_blank">여기</a>에서 그 문제를 해결해주고 있긴 한데요. 정규식을 이용한 방법으로 나름 참신하게 접근하긴 했습니다만, "모든 경우에 적용 가능한 정규식은 만들 수 없었다"고 한 게 좀 그래서 저는 그냥 "<a href="https://github.com/e-/Hangul.js" target="_blank">Hangul.js</a>" 라이브러리를 쓰기로 했습니다. `Hangul.js` 라이브러리를 쓰면 모든 경우에 적용 가능한 한글 검색어 자동완성을 구현할 수 있거든요.

한글 검색어 자동완성 관련해서 다른 자료가 필요한 분은 아래 링크들을 참고하시면 됩니다.
- <a href="https://bluewings.github.io/unobstructed-hangul-regular-expression/" target="_blank">한글 자동완성을 위한 정규식</a> (<a href="https://github.com/bluewings/korean-regexp" target="_blank">https://github.com/bluewings/korean-regexp</a>)
- <a href="https://github.com/ryuken73/node_chosung_search" target="_blank">한글 자동완성 및 초성검색 구현</a>
- <a href="https://github.com/whdckszxxx/vue-korean-autocomplete" target="_blank">vue-korean-autocomplete</a>

그럼 이제 본격적으로 Svelte에서 `Hangul.js` 라이브러리를 이용한 한글 검색어 자동완성 페이지를 만들어보겠습니다.

## 1. Svelte 설치하기
```bash
$ npx degit sveltejs/template svelte-korean-autocomplete
$ cd svelte-korean-autocomplete
$ npm install
```

## 2. Hangul.js 라이브러리 설치하기
```bash
$ npm install hangul-js
```

## 3. VSCode 실행해서 KoreanAutocomplete.svelte 작성하기
```bash
$ code .
```
#### 검색할 단어들은 편의상 src/word-list.js 파일에 담아둡니다.
```javascript
export const wordList = ['나물비빔밥', '오곡밥', '잡채밥', '콩나물밥', '약식', ...];
```

#### KoreanAutocomplete.svelte 로직은 다음과 같이 작성했습니다.
```html
<script>
    import Hangul from 'hangul-js'; // Hangul.js 라이브러리는 이렇게 import하면 됩니다.
    import { wordList } from "./word-list.js"; // word-list.js 파일의 배열변수 wordList도 이렇게 import합니다.

    let inputText = ''; // 검색어 입력란에서 글자를 받아내는 변수입니다.

    function matchedWords( searchText ) { // 검색어가 음소단위로 입력될 때마다 호출되는 함수입니다.
        let searcher = new Hangul.Searcher(searchText); // 함수가 호출되면 일단 검색어 문자열을 음소단위로 분리해놓습니다.
        let output = [];    // 검색어가 포함된 단어들을 담아낼 배열 변수입니다.
        let search_v = -1;  // 검색 대상 단어에 검색어의 위치값을 담아두는 변수이며, default -1은 검색어가 포함되어 있지 않다는 의미입니다.
        wordList.forEach( word => { // 검색 대상 단어들을 하나씩 확인합니다.
            search_v = searcher.search(word); // 검색 대상 단어에 검색어 위치값을 받아냅니다.
            if (search_v >= 0) { // 검색어 위치값이 0 이상이면 검색 대상 단어에 검색어의 음소나 음절이 존재한다는 의미입니다.
                output.push({ text: word, id: search_v }); // 검색어의 음소나 음절이 포함된 단어를 검색 결과 배열에 담습니다. 검색어 위치값도 챙깁니다.
            }
        })
        output.sort(function (a,b){ return a.text < b.text ? -1 : a.text > b.text ? 1 : 0; }); // 검색어의 음소나 음절이 포함된 단어들을 일단 가나다 순으로 정렬합니다.
        output.sort(function (a,b){ return a.id - b.id }); // 검색 결과 단어들을 검색어 위치값 순으로 정렬합니다. 이렇게 해야 검색어의 음소에 가장 가까운 단어가 최상단에 배치됩니다.
        return output; // 검색 결과를 내보냅니다.
    }
    function makeBold( targetWord ) { // 검색된 문자열에서 검색어의 음소나 음절이 포함된 부분에 강조 표시하는 함수입니다.
        let shift = 0; // 검색된 문자열에서 검색어 음절 앞뒤 위치를 보정해주는 변수입니다.
        let strArray = targetWord.split(''); // 검색된 문자열을 음절 단위로 나누어 배열에 담습니다.
        const boldPoints = Hangul.rangeSearch(targetWord, inputText); // 검색된 문자열에서 검색어 음절의 앞뒤 위치값들을 배열에 담습니다.
        boldPoints.forEach( indexs => {
            strArray.splice(indexs[0]+(shift++),0,'<b style="color:#1E94FC;">'); // 검색어 음절 앞에 강조 표시를 위한 HTML 태그를 삽입합니다.
            strArray.splice(indexs[1]+1+(shift++),0,'</b>'); // 검색어 음절 뒤에 강조 표시 종료 태그를 삽입합니다.
        })
        return `${strArray.join('')}`; // 검색어 음절들이 강조 표시된 문자열을 String으로 변환해서 내보냅니다.
    }
</script>

<div class="content">
    <div id="search_div">
        검색어를 입력하세요: <input bind:value={inputText}>
    </div>
    <div>
        {#each matchedWords(inputText) as matched_word}
            {@html makeBold(matched_word.text)} <br>
        {/each}
    </div>
</div>

<style>
    #search_div {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        background-color: white;
    }
    input {
        width: 100%;
    }
</style>
```

이렇게 작성된 `KoreanAutocomplete.svelte` 컴포넌트를 `App.svelte`에서 import 하면 한글 검색어 자동완성 페이지를 완료할 수 있습니다.
```html
<script>
	import KoreanAutocomplete from './KoreanAutocomplete.svelte';
</script>
<div class="content">
	<div>
		<KoreanAutocomplete />
	</div>
</div>
```

이 한글 검색어 자동완성 컴포넌트는 한글 검색 기능이 필요한 어디서든 사용할 수 있습니다. Svelte 특유의 간결함 덕분에 소스코드를 이해하기 어렵지 않을 거라 생각합니다. `<script>` 영역은 그냥 일반적인 바닐라 자바스크립트 코드이고, Svelte만의 syntax는 `<div class="content">` 영역에 HTML 태그와 함께 있는 코드가 전부입니다. 

`<input bind:value={inputText}>` 여기서 `bind:value={inputText}` 요부분이 Svelte만의 syntax인데요. HTML의 `<input>`태그로 만들어진 입력란에서 글자를 타이핑하면, 그 검색어 문자열이 `inputText` 변수에 바인딩된다는 뜻입니다.

vue에선 <a href="https://webruden.tistory.com/485" target="_blank">한글 입력시 커서가 위치한 음소나 음절이 바인딩되지 않는 문제</a>가 있다보니 <a href="https://github.com/whdckszxxx/vue-korean-autocomplete" target="_blank">vue-korean-autocomplete</a>에서 구현한 것처럼 키 입력에 대한 이벤트 처리 코드가 복잡하게 들어가기도 하는데요. <a href="https://webruden.tistory.com/485" target="_blank">여기</a>에선 비교적 간단하게 해결하던데 코드의 복잡성 차이가 이렇게 크게 발생하는 자세한 이유까진 살펴보지 않았지만, 아무튼 svelte에선 어떤 추가 작업도 필요 없습니다. svelte에선 (별도의 키입력 이벤트 처리없이) 한글 입력시 커서가 위치한 음소나 음절도 정확하게 바인딩되기 때문에 `bind:value={inputText}` 이것만으로도 한글 문자열을 알파벳 다루듯 처리할 수 있습니다.

`{#each matchedWords(inputText) as matched_word} ... {/each}` 이 코드도 Svelte만의 로직인데요. 바닐라 자바스크립트로 번역하면 `for (const matched_word in matchedWords(inputText)) { ... }` 이렇게 되겠죠. `{@html makeBold(matched_word.text)}` 이 코드는 검색된 문자열에서 검색어의 음소/음절 부분에 강조 표시한 결과를 화면에 표시하되, 강조 표시로 사용된 HTML 태그를 랜더링하기 위해 `@html`이 사용되었습니다.

`<style>` 영역에 있는 css는 딱히 어려울 게 없을 듯한데요. `#search_div`는 화면 스크롤시 상단에 고정되도록 하는 css가 작성된 것이고, `input`는 입력란 너비가 화면에 꽉 차게 하는 css입니다. svelte에선 각 컴포넌트의 `<style>` 지정이 해당 컴포넌트의 HTML 태그에만 반영되기 때문에, `input` 같은 특정 태그 자체에 스타일 지정하더라도 다른 컴포넌트의 `input`에는 전혀 영향을 주지 않습니다. svelte 컴포넌트의 HTML 코드가 복잡하지 않다면 그냥 심플하게 태그 자체에 스타일을 지정할 수 있어서 HTML 코드가 아주 간결해지고 스타일 지정이 그만큼 간편해집니다.

그럼 이제 다 됐습니다. 여기서 소개한 svelte 컴포넌트의 기능은 <a href="https://lee-eung.github.io/svelte/korean-autocomp/" target="_blank">Svelte로 만든 한글 검색어 자동완성 페이지</a>에서 테스트해보실 수 있습니다.

그리고 여기선 검색할 단어들을 편의상 `src/word-list.js` 파일에 담아두고 작업했지만, REST API를 통해`fetch`로 데이터를 가져와서 작업할 수도 있을텐데요. 이럴 땐 `src/word-list.js`에서 대략 다음과 같이 코드를 작성하면 될 겁니다.

```javascript
function getData() {
    let titles = [];

    fetch('https://jsonplaceholder.typicode.com/albums') // 이건 그냥 예시로 사용한 free online REST API입니다. 여기선 앨범 리스트(fake data)를 가져옵니다.
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                titles.push(element.title); // 앨범 리스트에서 제목만 배열에 담습니다.
            });
        });

    return titles;
}

export const wordList = getData(); // fetch로 가져온 배열을 svelte 컴포넌트에서 쓸 수 있게 export 처리합니다.
```

이상으로 "Svelte로 한글 검색어 자동완성 구현하기"를 마치겠습니다. 아마 이 정도면 svelte로 앱을 만들 때 검색어 자동완성 컴포넌트를 다양하게 활용할 수 있을 듯한데요. 중요한 내용은 모두 다뤄졌다고 생각되지만 혹시 빠트린 내용이 있으면 <a href="https://lee-eung.github.io/svelte-korean-autocomplete/" target="_blank">제 블로그</a> 댓글로 말씀해주시기 바랍니다. 끝까지 읽어주셔서 감사합니다. ^^
