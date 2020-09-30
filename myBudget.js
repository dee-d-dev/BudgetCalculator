//BUGDET CONTROLLER
var budgetCtrl = (function(){

    var Expense = function(id,description,value,percentage){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = percentage;
    };

    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/ totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentages = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function(type){
        var sum = 0;

        data.allItems[type].forEach(function(current){
            sum += current.value;
        });

        data.totals[type] = sum; 

    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: 0
    };

    return {
        addItems: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on the 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type = 'inc'){
               newItem = new Income(ID, des, val);

            }

            //Push into data structure
            data.allItems[type].push(newItem);

            //return new element
            return newItem;
        },

        deleteItem: function(type, id){
            var ids, index;
            /*
                id = 6
                ids = [1 2 4 6 8]
                index = 3
            */
            ids = data.allItems[type].map(function(myData) {
                return myData.id;
            });

            index = ids.indexOf(id);

            if(index !== -1) {
                data.allItems[type].splice(index, 1)
            }
        },

        calculateBudget: function(){

            //Calculate total income and total expenses
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: Total income - Total expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentages of the income we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1; 
            }

            //Percentage calculation : expense / income * 100 e.g expense = 500, income = 200; 500 / 200 * 100
        },  
        
        calculatePercentages: function(){
            /*
            a = 10
            b = 20
            c = 30
            income = 100

            a% = (10/100) * 100 = 10%
            b% = (20/100) * 100 = 20%
            c% = (30/100) * 100 = 30%

            */

            data.allItems.exp.forEach(function(e){
                e.calcPercentages(data.totals.inc);
            })
        },

        getPercentages: function(){
            var allPercentages = data.allItems.exp.map(function(e){
                return e.getPercentages();
            });

            return allPercentages;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function() {
            console.log(data);
        }

    }
})();


//UI CONTROLLER
var UICtrl = (function(){

    var DOMstring = {
        inputType:'.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.icon',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        /*
           1. + or - sign before the number
           2. all numbers should be in 2 decimal number
           3. the use of comma in separating thousands
        */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        dec = numSplit[1];


        if(int.length > 3) {
            //example number 23450
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); 
        }


        return (type === 'exp'? '-' : '+') + int + '.' + dec;
 


    };

    var nodeLIstForEach = function(list, callback){
        for(var i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    }

    return {
        getInput: function(){

            return {

                type: document.querySelector(DOMstring.inputType).value, //shows either increase or expense
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
                
            };

        },

        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type === 'inc') {
                element = DOMstring.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><svg class="iconDelete" id="icon"><use xlink:href="img/newSprite.svg#icon-cancel-circle" class="add__btn"></use></svg></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;

                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><svg class="iconDelete" id="icon"><use xlink:href="img/newSprite.svg#icon-cancel-circle" class="add__btn"></use></svg></button></div></div></div>';
            }

            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

        deleteListItem: function(selector){
            var element;
            element = document.getElementById(selector);
            element.parentNode.removeChild(element)
        },

        clearField: function() {
            var fields,fieldsArr;

            fields = document.querySelectorAll(DOMstring.inputDescription + ',' + DOMstring.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(currentState, index, array){
                currentState.value = "";
            });

            fieldsArr[0].focus();
        },

        displayBudget: function(obj){
            var type;
            obj.budget > 0? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            } else{
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }

        },

        displayPercentages: function(percentage){
            var fields = document.querySelectorAll(DOMstring.expensePercentageLabel);

            nodeLIstForEach(fields, function(current, index){
                if(percentage[index] > 0){
                    current.textContent = percentage[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
            
        },

        displayMonth: function(){
            var currentDate, currentYear,currentMonths, currentMonth, currentDay;
            currentDate = new Date();
            currentDay = currentDate.getDate();
            currentMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October','Nvember', 'December']
            currentMonth = currentDate.getMonth();
            currentYear = currentDate.getFullYear();
            
            document.querySelector(DOMstring.dateLabel).textContent = currentDay + ',' + currentMonths[currentMonth] + " " + currentYear;

        },

        changedType: function(){
            var fields = document.querySelectorAll(DOMstring.inputType + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue)
            
            nodeLIstForEach(fields, function(event) {
                event.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.inputButton).classList.toggle('red');
        },

        getDOMstring: function(){
            return DOMstring;
        }
    }
})();


//MAIN APP CONTROLLER
var mainCtrl = (function(budgetController, UIController) {


    var setupEventListeners = function(){

        var DOMaccess = UICtrl.getDOMstring();

        document.querySelector(DOMaccess.inputButton).addEventListener('click', mainFunction);

        document.querySelector(DOMaccess.inputType).addEventListener('change', UICtrl.changedType);

        document.addEventListener('keypress', function(e){
            if(e.keyCode ===  13 || e.which === 13){
                mainFunction();
            }
        });

        document.querySelector(DOMaccess.container).addEventListener('click', ctrlDeleteItem)
    };

    var updateBudget = function(){

        //Calculate the budget
        budgetCtrl.calculateBudget();

        //Return the budget
        var budget = budgetCtrl.getBudget();

        //Display the budget on the User Interface
        UICtrl.displayBudget(budget);  
        
    };

    var updatePercentages = function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();

        //read percentages from the budget controller
        percentage = budgetCtrl.getPercentages();

        //update the UI with the new percentages
        UICtrl.displayPercentages(percentage);
    }


    var mainFunction = function(){
        var input, newItem;
        //Get the input values
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //Add to budget controller
            newItem = budgetController.addItems(input.type, input.description, input.value)

            //Add item to User Interface
            UICtrl.addListItem(newItem, input.type);

            //Clear the the input fields
            UICtrl.clearField();

            //Calculate and update Budget
            updateBudget();

            //calculate and update percentages 
            updatePercentages();
        } else {
            alert('Please fill in fields');
        }


    };

    var ctrlDeleteItem = function(e){
        var itemID, splitID, ID; 
        itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //delete budget from the UI
            UICtrl.deleteListItem(itemID);

            //delete budget from the data structure
            budgetCtrl.deleteItem(type,ID);

            //re-calculate and update new budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();

        }
    };

    return{
        init: function(){
            console.log('Application don start');
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

        }

    };
    
    
    
   
})(budgetCtrl, UICtrl);

mainCtrl.init();

/*
Code written by me Adedigba Adedotun Emmanuel
*/