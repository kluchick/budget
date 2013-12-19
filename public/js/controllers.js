'use strict';

/* Controllers */

/**
 * Application main cotroller
 */
var myApp = angular.module('myApp.controllers', []);

function AppCtrl ($scope, $http) {
    var budget = {};
    budget.infoMessage = '';

    initBudget($http, budget, function(err, filledBudged){
        if (filledBudged !== null){
            budget = filledBudged;
            console.log('Init budget:'+ angular.toJson(budget));
        }
    });
    var emptyFunc = function(){};
    // budget.getCategories(emptyFunc);
    budget.getAccounts();
    budget.getPeriods(emptyFunc);

    $scope.budget = budget;
//    $scope.myResolveName = myResolveName;
  }
  myApp.controller('AppCtrl', AppCtrl);

  /**
   * Charge list controller
   */
  function ChargeListCtrl($scope, $http, ngTableParams) {
      $scope.name = 'ChargeListCtrl name';
      $scope.budget.getPeriods(function(err, newBudget){
        if (newBudget){
            for (var i in newBudget.periods){
                var cur = newBudget.periods[i];
                if (cur.id === newBudget.curPeriod){
                    console.log('ChargeListCtrl dateFrom='+cur.dateFrom+'; dateTo = '+cur.dateTo);
                    $scope.budget.dateFrom = cur.dateFrom;
                    $scope.budget.dateTo = cur.dateTo;
                    $scope.budget.categorId = null;
                    $scope.budget.getCharges();
                    $scope.budget.getCategories(function(){});
                }
            }
            // $scope.budget.periods = newBudget.periods;
        }
      });
      /**
       * Apply filter action
       */
    $scope.getCharges = function(){
        console.log('$scope.getCharges selectedCategory:');
        console.log($scope.selectedCategory);
        if (typeof $scope.selectedCategory === 'undefined'){
            $scope.selectedCategory = null;
        }
        if ($scope.selectedCategory === null){
            $scope.budget.categoryId = null;
        }else{
            $scope.budget.categoryId = $scope.selectedCategory.id;
        }
        $scope.budget.getCharges();
    };
  }

  myApp.controller('ChargeListCtrl', ChargeListCtrl);
  
  /**
   * Add new charge controller
   */
  myApp.controller('AddChargeCtrl', function ($scope) {
    // write Ctrl here
    $scope.name = 'AddChargeCtrl name';
    $scope.budget.curCharge.money = parseInt($scope.budget.curCharge.money);
    $scope.budget.getCategories(function(err, newBudget){
        if (newBudget){
            $scope.budget.categories = newBudget.categories;
            $scope.budget.defaultCategory = newBudget.defaultCategory;
        }
    });
    $scope.setDefaultCategory = function (){
      console.log("setDefaultCategory ...");
      $scope.budget.curCharge.selectedCategory = $scope.budget.defaultCategory;
      $scope.budget.curCharge.newCategory = null;
    };
//      debugger;

  });

  
  /**
   * Accounts list controller
   */
myApp.controller('AccountsCtl', function ($scope, $http) {
    $scope.name = 'AccountsCtl name';

    $scope.changeAccountValue = function(accountToChange, newValue){
        console.log('Start changeAccountValue ...');
        $http({
            method: 'POST',
            url: '/api/changeAccountValue',
            data: {accountId: accountToChange.id, oldValue:accountToChange.money, newValue: newValue}
        }).
            success(function (data, status, headers, config) {
                console.log('changeAccountValue success  ...');
                $scope.budget.infoMessage = data.result;
                $scope.budget.flags.recalculateAccountMoney = 1;
                $scope.budget.recalculateAccountMoney(accountToChange.id, newValue);               
            }).
            error(function (data, status, headers, config) {
                $scope.budget.infoMessage = data.result;
        });
    };
});

/**
 * Controller for periods page
 */
myApp.controller('PeriodsCtl', function ($scope, $http) {
    $scope.name = 'PeriodsCtl name';
    $scope.finishCurrentPeriod = function(){
        console.log('Start finishCurrentPeriod ...\n curPeriod = '+ $scope.budget.curPeriod);
        $http({
            method: 'POST',
            url: '/api/finishCurPeriod',
            data: {curPeriod: $scope.budget.curPeriod}
        }).
            success(function (data, status, headers, config) {
                console.log('PeriodsCtl success finisPeriod ...');
                $scope.budget.infoMessage = data.result;
                $scope.budget.periods = null;
                $scope.budget.getPeriods();                
            }).
            error(function (data, status, headers, config) {
                $scope.budget.infoMessage = data.result;
        });
    };

    $scope.addNewPeriod = function(periodName, dateFrom){
        console.log('addNewPeriod dateFrom = '+dateFrom);
        $http({
            method: 'POST',
            url: '/api/addNewPeriod',
            data: {dateFrom: dateFrom, periodName: periodName}
        }).
            success(function (data, status, headers, config) {
                $scope.budget.infoMessage = data.result;
                $scope.budget.periods = null;
                $scope.budget.getPeriods();                
            }).
            error(function (data, status, headers, config) {
                $scope.budget.infoMessage = data.result;
        });
    };
});

  /**
   * Planning controller
   */
function PlanningCtl ($scope, $http) {

    /**
     * Constructor
     */
    $scope.name = 'PlanningCtl name';
    $scope.budget.getPeriods(function(err, newBudget){
        if (newBudget){
            $scope.budget.periods = newBudget.periods;
            $scope.budget.curPeriod = newBudget.curPeriod;
            $scope.budget.getPlans(function(err, plans){
                if (plans){
                    $scope.budget.currentPlans = plans;
                    $scope.calcTotalAmounts();
                }
            });
        }
        $scope.selectedPeriod = newBudget.curPeriod;
    });
    $scope.budget.getCategories(function(err, newBudget){
        if (newBudget){
            $scope.budget.categories = newBudget.categories;
            $scope.budget.defaultCategory = newBudget.defaultCategory;
        }
        $scope.newPlanCategory = $scope.budget.defaultCategory;
    });
    /*
    Used if you don't want to create new category after starting
     */
    $scope.setDefaultCategory = function (){
      $scope.newPlanCategory = $scope.budget.defaultCategory;
    };

/*
Add new planing value
 */
    $scope.addNewPlan = function(period, categoryId, money, createCategoryName){
        if (createCategoryName != null){
            $scope.budget.addCategory(createCategoryName, function(err, categoryId){
                if (categoryId){
                    console.log(categoryId);
                    $http({
                        method: 'POST',
                        url: '/api/addNewPlan',
                        data: {period: period, categoryId: categoryId, money: money}
                    }).
                        success(function (data, status, headers, config) {
                            $scope.budget.infoMessage = data.result;
                            var createdPlan = {"name":createCategoryName,"planned":money};
                            console.log(createdPlan);
                            console.log($scope.budget.currentPlans);
                            $scope.budget.currentPlans.push(createdPlan);
                        }).
                        error(function (data, status, headers, config) {
                            $scope.budget.infoMessage = data.result;
                    });
                }
            });
        }else{
            $http({
                method: 'POST',
                url: '/api/addNewPlan',
                data: {period: period, categoryId: categoryId, money: money}
            }).
                success(function (data, status, headers, config) {
                    $scope.budget.infoMessage = data.result;
                    var createdPlan = {"periodId":$scope.selectedPeriod,"periodName": $scope.budget.currentPlans[0].periodName,"categoryName":$scope.newPlanCategory.Name,"value":money};
                    console.log(createdPlan);
                    $scope.budget.currentPlans.push(createdPlan);
                }).
                error(function (data, status, headers, config) {
                    $scope.budget.infoMessage = data.result;
            });
        }

    };

/**
 * Calculate left amount for each row
 */
    $scope.calcLeft = function (planned, spend){
        var result = planned;
        if (planned !== null && spend !== null){
            result = planned - spend;
        }
    return result;
    };

    /*
    Calculate total amounts of money
     */
    $scope.calcTotalAmounts = function(){
        $scope.budget.totals.totalSpend = 0;
        $scope.budget.totals.totalRestToSpend = 0;
        for (var i in $scope.budget.currentPlans){
            var cur = $scope.budget.currentPlans[i];
            $scope.budget.totals.totalSpend += cur.spend;
            var left = $scope.calcLeft(cur.planned, cur.spend);
            if (left !== null){
                $scope.budget.totals.totalRestToSpend +=left;
            }
        }
        // $scope.budget.totals.totalRest = $scope.budget.totals.totalAmount - $scope.budget.totals.totalSpend;
    };

};
myApp.controller('PlanningCtl', PlanningCtl);


/**
 * Function block
 * *************************
 */

/**
 * Initialisation of budget object
 * Fill default values:
 *      - defaultAccount
 *      - defaultCategory
 *      - curPeriod
 *      - currentCharge{selectedAccount, selectedCategory, name, money, newCategory}
 * Declare budget functions:
 *      - getCategories()
 *      - getAccounts()
 *      - getCharges()
 *      - addCharge(name, money, category, account)
 *      - getPeriods()
 */
function initBudget($http, aBudget, callback){

    aBudget.name = 'Budgen project';
    aBudget.defaultAccount = null;
    aBudget.defaultCategory = null;
    aBudget.curPeriod = null;

    var currentCharge = {};
    currentCharge.selectedAccount = null;
    currentCharge.selectedCategory = {"id":3,"Name":"Одежда"};
    currentCharge.name = null;
    currentCharge.money = "50";
    currentCharge.newCategory = null;
    aBudget.curCharge = currentCharge;

    var totals = {};
    totals.totalSpend = 0;
    totals.totalAmount = 0;
    totals.totalRest = 0;
    totals.totalRestToSpend = 0;
    aBudget.totals = totals;

    var flags = {};
    flags.updateAccountMoney = 0;
    aBudget.flags = flags;

/**
 * Get list of categories
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
    aBudget.getCategories = function(callback){
        if (aBudget.categories == null){
            $http({
                method: 'GET',
                url: '/api/getCategories'
            }).
                success(function (data, status, headers, config) {
                    console.log('getCategories. data = '+data);
                    aBudget.categories = data;
                    aBudget.defaultCategory = aBudget.categories[0];
                    for (var i in aBudget.categories){
                        var cur = aBudget.categories[i];
                        if (cur.Name === "Еда"){
                            aBudget.defaultCategory = cur;
                        }
                    }
                    aBudget.curCharge.selectedCategory = aBudget.defaultCategory;
                    callback(null, aBudget);
                }).
                error(function (data, status, headers, config) {
                    console.log('getCategories. error');
                    aBudget.categories = 'Error!!!'+data;
                    callback(data, aBudget);
                });
        }else{
            callback(null, aBudget);
        }
    };

/**
 * Get list of accounts
 * @return {[type]} [description]
 */
    aBudget.getAccounts = function(){
        $http({
            method: 'GET',
            url: '/api/getAccounts'
        }).
            success(function (data, status, headers, config) {
                console.log('getAccounts. data = '+data);
                aBudget.accounts = data;
                aBudget.defaultAccount = aBudget.accounts[1];
                aBudget.totals.totalRest = aBudget.accounts[0].totalAmount;
                aBudget.curCharge.selectedAccount = aBudget.defaultAccount;
                callback(null, aBudget);
            }).
            error(function (data, status, headers, config) {
                console.log('initBudger. error');
                aBudget.accounts = 'Error!!!'+data;
                callback(data, aBudget);
            });
    };

/**
 * read charges for defined period
 * @return {[type]} [description]
 */
    aBudget.getCharges = function(){
        $http({
            method: 'GET',
            url: '/api/getCharges',
            params: {dateFrom: aBudget.dateFrom, dateTo: aBudget.dateTo, categoryId: aBudget.categoryId}
        }).
            success(function (data, status, headers, config) {
                var sumMoney = 0;
                aBudget.charges = data;
                for (var i in data){
                    var cur = data[i];
                    if (cur.category !== 'Пополнение'){
                        sumMoney +=cur.Money;
                    }
                }
                aBudget.sumMoney = sumMoney;
            }).
            error(function (data, status, headers, config) {
                aBudget.charges = 'Error!';
            });
    };

/**
 * Add simple charge or create category and add charge
 * @param {[type]} name     [description]
 * @param {[type]} money    [description]
 * @param {[type]} category [description]
 * @param {[type]} account  [description]
 */
    aBudget.addCharge = function(name, money, category, account, transferAccount){
        var emptyFunc = function(){};
        if (typeof transferAccount == 'undefined'){
            transferAccount = null;
        }
        console.log('addCategory.transferAccount = '+transferAccount);
        // money = money.replace(',', '.');
        if (aBudget.curCharge.newCategory !== null){
            aBudget.addCategory(aBudget.curCharge.newCategory, function(err, createdCategory){
                aBudget.curCharge.newCategory = null;
                if (createdCategory){
                    aBudget.addSimpleCharge(name, money, createdCategory, account, emptyFunc);
                }
            });
        }else{
            aBudget.addSimpleCharge(name, money, category, account, emptyFunc);
        }
        if (transferAccount !== null && transferAccount >= 0){
            money = 0 - parseInt(money);
            aBudget.addSimpleCharge(name, money, category, transferAccount, emptyFunc);
            aBudget.curCharge.transferAccount = null;
            transferAccount = null;
        }

    };

/**
 * Add simple charge to DB
 * @param {[type]}   name     [description]
 * @param {[type]}   money    [description]
 * @param {[type]}   category [description]
 * @param {[type]}   account  [description]
 * @param {Function} callback [description]
 */
    aBudget.addSimpleCharge = function(name, money, category, account, callback){
        console.log('name:'+name+', money:'+money+', category:'+category+', account:'+account);
        $http({
            method: 'POST',
            url: '/api/addCharge',
            data: {name: name, money: money, category: category, account: account}
        }).
            success(function (data, status, headers, config) {
                aBudget.infoMessage = data;
                aBudget.curCharge.selectedAccount = aBudget.defaultAccount;
                aBudget.curCharge.selectedCategory = aBudget.defaultCategory;
                aBudget.curCharge.name = "";
                aBudget.curCharge.money = "50";
                aBudget.recalculateAccountMoney(account, money);
                callback(null, aBudget);
                
            }).
            error(function (data, status, headers, config) {
                aBudget.infoMessage = 'Error during charge creation';
                callback(aBudget.infoMessage, null);
        });
    };

/**
 * Change money value for account after charge createion withour re-reading from DB
 * @param  {[type]} accountId [description]
 * @param  {[type]} money     [description]
 * @return {[type]}           [description]
 */
    aBudget.recalculateAccountMoney = function(accountId, money){
        money = parseInt(money);
        aBudget.totals.totalAmount = 0;
        for (var i in aBudget.accounts){
            if (aBudget.accounts[i].id === accountId){
                if (aBudget.flags.recalculateAccountMoney > 0){
                    aBudget.accounts[i].money =  money;    
                    aBudget.flags.recalculateAccountMoney = 0;                    
                }else{
                    aBudget.accounts[i].money = parseInt(aBudget.accounts[i].money) - money;  
                }
            }
            aBudget.totals.totalAmount = aBudget.totals.totalAmount + aBudget.accounts[i].money;
        }
        
    };

/**
 * Add new category to DB
 * @param {[type]}   categoryName [description]
 * @param {Function} callback     [description]
 */
    aBudget.addCategory = function(categoryName, callback){
        $http({
            method: 'POST',
            url: '/api/addCategory',
            data: {name: categoryName}
        }).
            success(function (data, status, headers, config) {
                var category = data.result;
                aBudget.infoMessage = "New category with id "+category+" has been created";
                console.log("controller.addCharge: "+aBudget.infoMessage);
                var createdCategory = {"id":category, "Name":categoryName};
                aBudget.categories.push(createdCategory);
                // aBudget.getCategories();
                callback(null, category);
            }).
            error(function (data, status, headers, config) {
                aBudget.infoMessage = 'Error during category insertion!';
                callback(data, null);
            });
    }
    
/**
 * Get list of periods
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
    aBudget.getPeriods = function(callback){
        if (aBudget.periods == null){
            $http({
                method: 'GET',
                url: '/api/getPeriods'
            }).
                success(function (data, status, headers, config) {
                    console.log('getPeriods. data = '+angular.toJson(data));
                    aBudget.periods = data;
                    
                    var curPeriod = data[0].curId || null;
                    aBudget.curPeriod = curPeriod;
                    callback(null, aBudget);
                }).
                error(function (data, status, headers, config) {
                    console.log('initBudger.getPeriods error');
                    aBudget.accounts = 'Error!!!'+data;
                    callback(data, aBudget);
                }); 
        }else{
            callback(null, aBudget)
        }

    };

/**
 * Get list of plans
 * @return {[type]} [description]
 */
    aBudget.getPlans = function(callback){
        $http({
            method: 'GET',
            url: '/api/getPlans',
            params: {periodId: aBudget.curPeriod}
          }).
            success(function (data, status, headers, config) {
              if (data.error){
                  aBudget.infoMessage = data.error;
                  callback(data.error, null);
              }else{
                  console.log('getPlans. data = '+angular.toJson(data));
                  aBudget.currentPlans = data;
                  aBudget.infoMessage = 'Plans has been successfule read';
                  callback(null, data);
              }
            }).
            error(function (data, status, headers, config) {
              if (data.error){
                  aBudget.infoMessage = data.error;
                  callback(data.error, null);
              }else{
                  aBudget.infoMessage = 'Error during reading plans';
                  callback(aBudget.infoMessage, null);
              }
            });  
    };
    
    
}
