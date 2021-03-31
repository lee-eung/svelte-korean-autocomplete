function getData() {
    const titles = [];

    fetch('https://jsonplaceholder.typicode.com/albums')
        .then(response => response.json())
        .then(data => {
            data.forEach(element => {
                titles.push(element.title);
            });
        });

    return titles;
}

const wordList = getData();    
export default wordList;