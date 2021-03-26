<script>
    import Hangul from 'hangul-js';
    import { wordList } from "./word-list.js";

    let inputText = '';

    function matchedWords( searchText ) {
        let searcher = new Hangul.Searcher(searchText);
        let output = [];
        let search_v = -1;
        wordList.forEach( word => {
            search_v = searcher.search(word);
            if (search_v >= 0) {
                output.push({ text: word, id: search_v });
            }
        })
        output.sort(function (a,b){ return a.text < b.text ? -1 : a.text > b.text ? 1 : 0; });
        output.sort(function (a,b){ return a.id - b.id });
        return output;
    }
    function makeBold( targetWord ) {
        let shift = 0;
        let strArray = targetWord.split('');
        const boldPoints = Hangul.rangeSearch(targetWord, inputText);
        boldPoints.forEach( indexs => {
            strArray.splice(indexs[0]+(shift++),0,'<b style="color:#1E94FC;">');
            strArray.splice(indexs[1]+1+(shift++),0,'</b>');
        })
        return `${strArray.join('')}`;
    }
</script>

<div class="content">
    <div id="search_div">
        음식 이름 검색 <input bind:value={inputText}>
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
