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
        fetch("https://api.exchangeratesapi.io/latest")
            .then(response => response.json())
            .then(json => {
                this.latestJson = Object.keys(json.rates);
                //ToDo: EUR
                for(let i=0; i<this.latestJson.length; i++){
                    this.flagPath[this.latestJson[i]] =  "css/flags/" + this.latestJson[i] + ".svg";
                }
            });
        this.refreshBaseCurrency();
    },
    methods:{
        clickToChange: function(){
            this.baseOnTopRow = !this.baseOnTopRow;
            this.refreshBaseCurrency();
        },
        refreshBaseCurrency: function(){
            if(this.baseOnTopRow)
                this.fetchBaseJson(this.topRow);
            else
                this.fetchBaseJson(this.leftCol);
        },
        fetchBaseJson: function (baseCurrency) {
            //fetchInOrder(this.baseCurrency);
            for(let i=0; i<baseCurrency.length; i++) {
                if (this.baseJson[baseCurrency[i]] == undefined) {

                    fetch("https://api.exchangeratesapi.io/latest?base=" + baseCurrency[i])
                        .then(response => response.json())
                        .then(json => {
                            this.baseJson[json["base"]] = json;
                            this.$forceUpdate();
                        });
                }
            }
        },
        clickToAdd: function(currencyType, addToRow){
            if(this.manageBoth){
                this.topRow.push(currencyType);
                this.leftCol.push(currencyType);
            }
            else if(addToRow){
                this.topRow.push(currencyType);
            }
            else{
                this.leftCol.push(currencyType);
            }
            this.refreshBaseCurrency();
        },
        ifDisabled: function(currencyType, isRow){ //return true if exist already
            if(this.manageBoth){
                return this.checkCurrency(currencyType, this.topRow) || this.checkCurrency(currencyType, this.leftCol);
            }
            else if(isRow){
                return this.checkCurrency(currencyType, this.topRow);
            }
            else{
                return this.checkCurrency(currencyType, this.leftCol);
            }
        },
        checkCurrency: function(currencyType, currencyList){
            for(each of currencyList){
                if(currencyType == each)
                    return true;
            }
            return false;
        },
        clickToRemove: function(currencyType, currencyList){
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