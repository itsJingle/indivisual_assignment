var storage = window.localStorage;

var app = new Vue({
    el:"#app",
    data:{
        amount: '1',
        topRow: ["CNY", "HKD"],
        leftCol: ["CNY", "HKD"],
        baseJson: {},
        baseOnTopRow: true,
        manageBoth: true,
        latestJson: [],
        flagPath: {},
    },
    created: function() {
        if(storage.getItem("latestJson") == null){
            fetch("https://api.exchangeratesapi.io/latest")
                .then(response => response.json())
                .then(json => {
                    this.latestJson = Object.keys(json.rates);
                    this.latestJson.push(json.base);
                    storage.setItem("latestJson", JSON.stringify(this.latestJson));
                    for(let i=0; i<this.latestJson.length; i++){
                        this.flagPath[this.latestJson[i]] =  "css/flags/" + this.latestJson[i] + ".svg";
                    }
                    storage.setItem("flagPath", JSON.stringify(this.flagPath));
                });
        }else{
            // this.latestJson = Object.keys(JSON.parse(storage.getItem("latestJson")).rates);
            // this.latestJson.push(JSON.parse(storage.getItem("latestJson")).base);
            this.latestJson = JSON.parse(storage.getItem("latestJson"));
            this.flagPath = JSON.parse(storage.getItem("flagPath"));
        }

        if(storage.getItem("topRow"))
            this.topRow = JSON.parse(storage.getItem("topRow"));
        else
            storage.setItem("topRow", JSON.stringify(this.topRow));


        if(storage.getItem("leftCol"))
            this.leftCol = JSON.parse(storage.getItem("leftCol"));
        else
            storage.setItem("leftCol", JSON.stringify(this.leftCol));

        this.baseJson = (storage.getItem("baseJson")) ? JSON.parse(storage.getItem("baseJson")): [];

        this.refreshBaseCurrency();
    },
    methods: {
        clickToChange: function () {
            this.baseOnTopRow = !this.baseOnTopRow;
            this.refreshBaseCurrency();
        },
        refreshBaseCurrency: function () {
            if (this.baseOnTopRow) {
                this.fetchBaseJson(this.topRow);
            }
            else {
                this.fetchBaseJson(this.leftCol);
            }
        },
        fetchBaseJson: function (baseCurrency) {
            //fetchInOrder(this.baseCurrency);
            for (let i = 0; i < baseCurrency.length; i++) {
                if (this.baseJson[baseCurrency[i]] == undefined) {
                    fetch("https://api.exchangeratesapi.io/latest?base=" + baseCurrency[i])
                        .then(response => response.json())
                        .then(json => {
                            this.baseJson[json["base"]] = json;
                            storage.setItem("baseJson", JSON.stringify(this.baseJson));
                            this.$forceUpdate();
                        })
                }
            }
        },
        clickToAdd: function (currencyType, addToRow) {
            if (this.manageBoth) {
                this.topRow.push(currencyType);
                this.leftCol.push(currencyType);
                storage.setItem("topRow", JSON.stringify(this.topRow));
                storage.setItem("leftCol", JSON.stringify(this.leftCol));

            }
            else if (addToRow) {
                this.topRow.push(currencyType);
                storage.setItem("topRow", JSON.stringify(this.topRow));
            }
            else {
                this.leftCol.push(currencyType);
                storage.setItem("leftCol", JSON.stringify(this.leftCol));
            }
            this.refreshBaseCurrency();
        },
        ifDisabled: function (currencyType, isRow) { //return true if exist already
            if (this.manageBoth) {
                return this.checkCurrency(currencyType, this.topRow) || this.checkCurrency(currencyType, this.leftCol);
            }
            else if (isRow) {
                return this.checkCurrency(currencyType, this.topRow);
            }
            else {
                return this.checkCurrency(currencyType, this.leftCol);
            }
        },
        checkCurrency: function (currencyType, currencyList) {
            for (each of currencyList) {
                if (currencyType == each)
                    return true;
            }
            return false;
        },
        clickToRemove: function (currencyType, currencyList) {
            currencyList.remove(currencyType);
        },
    }
});

/*
async function fetchInOrder(urls){
    const textPromises = urls.map(url => {
        return fetch("https://api.exchangeratesapi.io/latest?base=" + url).then(response => response.json());
    });
// 按次序输出
    textPromises.reduce((chain, textPromise) => {
        return chain.then(() => textPromise)
            .then(json => app.baseJson.push(json.rates));
    }, Promise.resolve());
}
*/

Array.prototype.indexOf = function(val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};


Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

// $(document).ready(function() {
//     fetch("https://api.exchangeratesapi.io/latest")
//         .then(response => response.json())
//         .then(json => {
//             app.latestJson = Object.keys(json.rates);
//             //ToDo: EUR
//             for(let i=0; i<app.latestJson.length; i++){
//                 app.flagPath[app.latestJson[i]] =  "css/flags/" + app.latestJson[i] + ".svg";
//             }
//         })
//     app.refreshBaseCurrency();
// });