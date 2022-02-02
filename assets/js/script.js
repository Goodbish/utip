const People = {
    link: 'https://swapi.dev/api/people',
    rawData: [],
    choppedData: {
        data: [{},{},{},{},{},{},{},{},{},{}],
        nameTrigger: false,
    },
    deleteButton: '<div class="table__cell-delete"></div>',
    sortButton: '<div class="table__cell-sort"><img src="./assets/img/sort.svg"></div>',


    init() {
        if (localStorage.getItem("data") !== null) {
            People.getLocalStorage();
            People.renderTable();
            People.toggleStatusMessage();
        } else {
            People.toggleStatusMessage('show');
        }
    },

    getButton() {
        People.preloaderTrigger('on');
        People.getData().then(function () {
            People.preloaderTrigger('off');
            People.chopData();
            People.setLocalStorage();
            People.renderTable();
            People.toggleStatusMessage();
        });
    },

    clearButton() {
        People.clearTable();
        People.renderTable();
        People.toggleStatusMessage('show');
    },

    async getData() {
        // Counter for api calls
        let counter = 1;
        // We don't want to send too many get request, so
        // if we don't get next 5 calls, then we should stop
        let errorCounter = 0;

        while (People.rawData.length <= 9) {
            try {
                let response = await fetch(People.link + '/' + counter);
                if (response.ok) { // 200-299
                    let responseData = await response.json();
                    People.rawData.push(responseData);
                    errorCounter = 0;
                } else {
                    errorCounter++;
                }
            } catch {
                alert('Something went wrong((')
            }

            if (errorCounter >= 4) {
                alert(`Sorry, can't get enough data :c`);
                return;
            }

            counter++;
        }

        return 1;
    },

    chopData() {
        if (People.rawData.length === 10) {
            People.rawData.forEach((element, i) => {
                let keyCounter = 0;
                for (const key of Object.keys(element)) {
                    People.choppedData.data[i][key] = element[key];
                    keyCounter++;
                    if (key === 'name') {
                        People.choppedData.nameTrigger = true;
                    }
                    if (keyCounter >= 6) {
                        return;
                    }
                }
            })
        } else {
            console.log(`We don't chop incomplete data ;)`);
        }
    },

    renderTable() {
        let headCells = document.querySelectorAll('.table__head .table__th:not(.table__th--empty)');
        let bodyRows = document.querySelectorAll('.table__body tr');

        People.setKeys();

        People.choppedData.data.forEach((element, i) => {
            let counter = 0;
            if (People.choppedData.nameTrigger) {
                headCells[i].innerHTML = element.name;
            }
            for (const key in element) {
                let row = bodyRows[counter].querySelectorAll('.table__cell');
                if (key === 'name') {
                    counter--;
                } else {
                    if (element[key] === 'clear') {
                        row[i].innerHTML = element[key];
                    } else {
                        row[i].innerHTML = element[key] + People.deleteButton;
                        let deleteButton = row[i].querySelector('.table__cell-delete');
                        deleteButton.addEventListener('click', function() {
                            element[key] = '';
                            People.setLocalStorage();
                            People.renderTable();
                        })
                    }
                }
                counter++;
            }
        })
    },

    setKeys() {
        const bodyRows = document.querySelectorAll('.table__body tr');
        const firstObj = People.choppedData.data[1];
        let keys = [];
        for (const key in firstObj) {
            if (firstObj[key] !== 'clear') {
                if (People.choppedData.nameTrigger) {
                    if (key !== 'name') {
                        keys.push(key);
                    }
                } else {
                    keys.push(key);
                }
            }
        }

        if (keys.length !== 0) {
            bodyRows.forEach((element, i) => {
                const th = element.querySelector('.table__th');
                th.innerHTML = keys[i] + People.sortButton;
                let sortButton = th.querySelector('.table__cell-sort');
                sortButton.addEventListener('click', function () {
                    People.sortData(keys[i]);
                    People.renderTable();
                })
            })
        }
    },

    getLocalStorage() {
        People.choppedData.data = JSON.parse(localStorage.getItem('data'));
        People.choppedData.nameTrigger = localStorage.getItem('nameTrigger');
    },

    setLocalStorage() {
        localStorage.setItem('data', JSON.stringify(People.choppedData.data));
        localStorage.setItem('nameTrigger', People.choppedData.nameTrigger);
    },

    clearTable() {
        People.choppedData.data.forEach(element => {
            for(const key in element){
                if(element.hasOwnProperty(key)){
                    element[key] = 'clear';
                }
            }
        })
        document.querySelectorAll('.table__body .table__th').forEach((th, i) => {
            th.innerHTML = `Item_a ${i + 1}`;
        });
        const itemsToDelete = document.querySelectorAll('.table__cell-sort , .table__cell-delete');
        for (const elem of itemsToDelete) {
            elem.remove();
        }
        localStorage.clear();
        People.toggleStatusMessage('show');
    },

    toggleStatusMessage(message) {
        const status = document.querySelector('.status');
        if (message === 'show') {
            status.classList.add('status--active')
        } else {
            status.classList.remove('status--active');
        }
    },

    sortData(property) {
        // TODO: Sort other direction
        if (typeof property === 'number') {
            People.choppedData.data.sort((a, b) => a[property] - b[property]);
        } else {
            People.choppedData.data.sort((a, b) => (a[property] > b[property]) ? 1 : -1);
        }
    },

    preloaderTrigger(status) {
        let preloader = document.querySelector('.preloader');
        if (status === 'on') {
            preloader.classList.add('preloader--active');
        } else {
            preloader.classList.remove('preloader--active');
        }
    },
}

const getButton = document.querySelector('#get-data');
const clearButton = document.querySelector('#clear-data');
getButton.addEventListener('click', People.getButton);
clearButton.addEventListener('click', People.clearButton);
People.init();
