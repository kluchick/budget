/*
 * Serve JSON to our AngularJS client
 */
var mysql      = require('mysql');
var dateFormat = require('dateformat');

var DATE_TIME_FORMAT = 'yyyy-mm-dd HH:MM:ss';

var connection = null;

exports.name = function (req, res) {
    res.json({
        name: 'Bob'
    });
};
/**
 * API method for return all charges
 * method: get
 * params: no
 */
exports.charges = function (req, res) {
    readCharges(null, null, function(err, charges){
        if (err){
            console.log('api.charges = error');
            res.json({
                charges: 'my charges'
            });
        }else{
            console.log('api.charges = '+charges);
            res.json(charges);
        }
    });
};

/**
 * API method for return charges for defined period
 * method: GET
 * params: dateFrom, dateTo
 */
exports.getCharges = function (req, res) {
    console.log('getCharges params:' +JSON.stringify(req.query));
    // var dateFromParam = (typeof req.query.dateFrom === 'undefined') ? null : req.query.dateFrom;
    var dateFromParam = checkEmpty(req.query.dateFrom);
    var dateToParam = checkEmpty(req.query.dateTo);
    var categoryIdParam = checkEmpty(req.query.categoryId);

    var dateFrom = new Date(0);
    var dateTo = new Date();    
    if (dateFromParam !== null){
        dateFrom = new Date(dateFromParam);
    }
    if (dateToParam !== null){
        dateTo = new Date(dateToParam);
    }
   // console.log('getCharges. dateFrom = '+dateFrom+' was: '+req.query.dateFrom);
   // console.log('getCharges. dateTo = '+dateTo+' was: '+req.query.dateTo);
   console.log('getCharges. category = '+categoryIdParam+' was: '+req.query.categoryId);
    readCharges(dateFrom, dateTo, categoryIdParam, function(err, charges){
        if (err){
            console.log('api.charges = error');
            res.json({
                charges: 'my charges'
            });
        }else{
//            console.log('api.charges = '+charges);
            res.json(charges);
        }
    });
};

/**
 * API method for add new charge to the table
 * method: POST
 * params: name, money, category, account
 */
exports.addCharge = function (req, res){
    var body = req.body;
    console.log(body.name+',' + body.money+', '+ body.category+', '+ body.account);
    addCharge(body.name, body.money, body.category, body.account, function(err, result){
        if(err){
            res.json({
                error: 'Charge wasn\'t added'
            });
        }else{
            res.json({
                result: result
            });
        }
    });
//    res.json(tempBody);
};

/**
 * API method for add new category to the table
 * method: POST
 * params: name
 */
exports.addCategory = function(req, res){
	var body = req.body;
	addCategory(body.name, function(err, result) {
        if(err){
            res.json({
                error: 'Category wasn\'t added'
            });
        }else{
            res.json({
                result: result
            });
        }
	});
};

/**
 * API method for read all categories from DB
 * method: GET
 * params: no
 */
exports.getCategories = function(req, res){
    readCategories(function(err, categories){
        if(err){
            res.json(err);
        }else{
            res.json(categories);
        }
    });
};

/**
 * API method for read all accounts from DB
 * method: GET
 * params: no
 */
exports.getAccounts = function(req, res){
    readAccounts(function(err, accounts){
        if(err){
            res.json(err);
        }else{
            res.json(accounts);
        }
    });
};

/**
 * API method for set value for selected account
 * method: POST
 * params: accountId, newValue
 */
exports.changeAccountValue = function(req, res){
    var accountId = typeof req.body.accountId === 'undefined' ? null : req.body.accountId;
    var oldValue = typeof req.body.oldValue === 'undefined' ? null : req.body.oldValue;
    var newValue = typeof req.body.newValue === 'undefined' ? null : req.body.newValue;
    console.log('changeAccountValue params: accountId = '+accountId+'; oldValue = '+oldValue+'; newValue = '+newValue);
    if (accountId !== null && oldValue !== null && newValue !== null){
        newValue = 0 - newValue;
        updateAccount(oldValue, accountId);
        updateAccount(newValue, accountId);
        res.json({result: 'changeAccountValue operation is finished'});
    }else{
        res.json({result: 'params for changeAccountValue are not correct'});
    }
};

/**
 * API method for read all periods
 * method: GET
 * params: no
 */
exports.getPeriods = function(req, res){
    readPeriods(function(err, periods){
        if (err){
            concole.log('getPeriods error:'+err);
            res.json(err);
        }else{
            res.json(periods);
        }
    });
};

/**
 * API method for close current open period
 * method: POST
 * params: curPeriod
 */
exports.finishCurPeriod = function(req, res){
    console.log('exports.finishCurPeriod ...');
    console.log('finishCurPeriod params:' +JSON.stringify(req.body));
    if (req.body.curPeriod){
        finishCurPeriod(req.body.curPeriod, function(err, result){
            if (err){
                res.json({result: 'Error during period finishing'});
            }else{
                res.json({result: 'Current period has been successfully finished'});
            }
        });        
    }else{
        console.log("exports.finishCurPeriod params curPeriod is not defined");
        res.json({result: 'finishCurPeriod params curPeriod is not defined'});
    }
};

/**
 * API method for insert new period in DB
 * method: POST
 * params: dateFrom
 */
exports.addNewPeriod = function(req, res){
    var periodName = req.body.periodName || null;
    if (req.body.dateFrom){
        addNewPeriod(periodName, req.body.dateFrom, function(err, result){
            if (err){
                res.json({result: 'Error duing inserting new period'});
            }else{
                res.json({result: 'New perios has been successfully inserted'});
            }
        });
    }else{
        res.json({result: 'dateFrom parameter for addNewPeriod function is not defined'});
    }
};

/**
 * API method for read plans for selected period
 * method: GET
 * params: periodId
 */
exports.getPlans = function(req, res){
    console.log('Start reading plans; periodId = '+req.query.periodId);
    if (req.query.periodId){
        readPlans(req.query.periodId, function(err, plans){
            if (err){
                concole.log('getPlans error:'+err);
                res.json({error: 'Error during reading plans for '+req.query.periodId+' period'});
            }else{
                res.json(plans);
            }
        }); 
    }else{
        res.json({error: 'parameter periodId is not defined'});
    }

};

/**
 * API method for insert new period in DB
 * method: POST
 * params: period, categoryId, money
 */
exports.addNewPlan = function(req, res){
    var period = (typeof req.body.period == 'undefined' ? null : req.body.period);
    var categoryId = (typeof req.body.categoryId == 'undefined' ? null : req.body.categoryId);
    var money = (typeof req.body.money == 'undefined' ? null : req.body.money);
    console.log('addNewPlan: period = '+period+'; categoryId = '+categoryId+'; money = '+money);
    if (period && categoryId && money){
        addNewPlan(period, categoryId, money, function(err, result){
            if (err){
                console.log('addNewPlan error: '+err);
                res.json({result: 'Error duing inserting new plan entry'});
            }else{
                res.json({result: 'New plan entry has been successfully inserted'});
            }
        });
    }else{
        res.json({result: 'One or more parameter for function addNewPlan are not defined'});
    }
};

/**
 * API method for update period in DB
 * method: POST
 * params: period, categoryId, money
 */
exports.updatePlan = function(req, res){
    var period = checkPresent(req.body.period);
    var categoryId = checkPresent(req.body.categoryId);
    var money = checkPresent(req.body.money);
    console.log('updatePlan: period = '+period+'; categoryId = '+categoryId+'; money = '+money);
    if (period && categoryId && money){
        updatePlan(period, categoryId, money, function(err, result){
            if (err){
                console.log('updatePlan error: '+err);
                res.json({result: 'Error duing inserting new plan entry'});
            }else{
                res.json({result: 'New plan entry has been successfully updated'});
            }
        });
    }else{
        res.json({result: 'One or more parameter for function updatePlan are not defined'});
    }
};


/**
 *                  Function block
 * ******************************************************
 * ******************************************************
 */


/**
 * Create new or return connection to mysql database
 * @returns {created connection}
 */
function getConnection(){
    if (connection === null){
        connection = initializeConnection({
            host: "localhost",
            user: "node",
            password: "node",
            database: "budget"
        });
    }
    return connection;
}

/**
 * Initialise connection and add lost connection handler
 * @param parameters of connection
 * @returns {created connection}
 */
function initializeConnection(config) {
    function addDisconnectHandler(connection) {
        connection.on("error", function (error) {
            if (error instanceof Error) {
                if (error.code === "PROTOCOL_CONNECTION_LOST") {
                    console.error(error.stack);
                    console.log("Lost connection. Reconnecting...");

                    initializeConnection(config);
                } else if (error.fatal) {
                    throw error;
                }
            }
        });
    }
    connection = mysql.createConnection(config);
    console.log('New connection has been created');
    // Add handlers.
    addDisconnectHandler(connection);

    connection.connect();
    return connection;
}

/**
 * Read charges from Charges table
 * @param dateFrom  - begin date of charges
 * @param dateTo    - end date of charges
 * @param callback  - callback function
 */
function readCharges(dateFrom, dateTo, category, callback){
    getConnection();
    // console.log('api.readCharges dateFrom = '+dateFrom+'; dateTo = '+dateTo);
    if (dateFrom === null){
        dateFrom = new Date(0);
    }
    if (dateTo === null){
        dateTo = new Date();
    }
    var dateFromStr = dateFormat(dateFrom, 'yyyy-mm-dd HH:MM:ss');
    var dateToStr = dateFormat(dateTo, 'yyyy-mm-dd HH:MM:ss');
    var categorySql = "";
    if (category !== null){
        categorySql = " AND cat.id = "+category+" ";
    }
    var sql = "SELECT ch.Name, ch.Money, cat.Name as category, ch.Date, ac.name as account "+
        " FROM charges ch, categories cat, accounts ac "+
        " WHERE ch.Category_id = cat.id" +
        " AND ch.Account = ac.id"+
        " AND ch.Date >=  ? "+
        " AND ch.Date <= ? "+
        categorySql +
        " ORDER BY ch.Date desc";
    // console.log("sql = "+sql);
    connection.query(sql,
        [dateFromStr, dateToStr],
        function(err, rows, fields){
            var charges = [];
            if (err){
                console.log(err);
                callback(err, null);
            }else{
                for(var i in rows){
                    var cur = rows[i];
                    cur.Date = dateFormat(cur.Date, DATE_TIME_FORMAT);
                    charges.push(cur);
                }
            }
            // console.log('Result: '+ JSON.stringify(charges));
            callback(null, charges);
        });

//    connection.end();
}

/**
 * Function insert record into charges table and update account table
 * @param name
 * @param money
 * @param categoryId
 * @param accountId
 * @param callback
 */
function addCharge(name, money, categoryId, accountId, callback){
    getConnection();
    var result = null;
    var sql = "INSERT INTO `charges`(Name, Money, Account, Category_id, Date) VALUES (?,?,?,?, sysdate())";
    connection.query(sql,[name, money, accountId, categoryId], function(err, rows, fields){
        if(err){
            console.log(err);
            callback(err, null);
        }else{
            updateAccount(money, accountId);
            result = 'Charge '+name+' for '+money+' has been successfully inserted';
            callback(null, result);
        }
    });
}

/**
 * Function inserts new 
 * @param name
 * @param callback
 */
function addCategory(name, callback){
    getConnection();
    console.log("api.addCategory.name = "+name);
    var sql = "INSERT INTO categories(Name) VALUES (?)";
    connection.query(sql,[name], function(err, rows, fields){
        if(err){
            console.log("add category. insert category error: "+err);
            callback(err, null);
        }else{
//          read id of created category
          sql = "SELECT max(id) AS maxid FROM categories ";
          connection.query(sql, function(err, rows, fields){
            if (err){
              consol.log("addCategory. Read category Error: "+ err);
              callback(err, null);
            }else{
//            sent back new category
              var newCategoryId = rows[0].maxid;
              console.log("api.addCategory.newCategoryId = "+newCategoryId);
              callback(null, newCategoryId);
            }
          });
        }
    });
}


/**
 * Read categories from database and return map in callback
 * @param callback
 */
function readCategories(callback){
    getConnection();
    var sql = "SELECT id, Name FROM categories ORDER BY Name ";
    connection.query(sql, function(err, rows, fields){
        if(err){
            console.log(err);
            callback(err, null);
        }else{
            var categories = [];
            for (var i in rows){
                var cur = rows[i];
                categories.push(cur);
            }
            console.log('readCategories. categories = '+JSON.stringify(categories));
            callback(null, categories);
        }
    });
}

/**
 * Read accounts from database and return map in callback
 * @param callback
 */
function readAccounts(callback){
    getConnection();
    var sql = "SELECT id, name, money, (select sum(money)  from accounts) as totalAmount FROM accounts";
    connection.query(sql, function(err, rows, fields){
        if(err){
            console.log(err);
            callback(err, null);
        }else{
            var accounts = [];
            for (var i in rows){
                var cur = rows[i];
                accounts.push(cur);
            }
            console.log('readaccounts. accounts = '+JSON.stringify(accounts));
            callback(null, accounts);
        }
    });
}

/**
 * Function for update amount of money on account
 * @param money
 * @param accountid
 */
function updateAccount(money, accountid){
    getConnection();
    var sql = "UPDATE accounts SET money = (money - ?) WHERE id = ?";
    connection.query(sql, [money, accountid], function(err, rows, fields){
        if (err){
            console.log('api.updateAccount error:'+err);
        }
    });
}

/**
 * Function for reading all periods from DB
 * @param callback
 */
function readPeriods(callback){
    getConnection();
    var sql = "SELECT (SELECT id FROM periods WHERE dateFrom < CURDATE()  AND dateTo is null  order by dateFrom LIMIT 1 ) as curId, id, name, dateFrom, dateTo FROM periods ";
    connection.query(sql, function(err, rows, fields){
        if (err){
            console.log('api.readPeriods error: '+err);
            callback(err, null);
        }else{
            console.log('api.readPeriods.periods = '+JSON.stringify(rows));
            var periods = [];
            for(var i in rows){
                var cur = rows[i];
                if (cur.dateFrom !== null){
                    cur.dateFrom = dateFormat(cur.dateFrom, DATE_TIME_FORMAT);                    
                }
                if (cur.dateTo !== null){
                    cur.dateTo = dateFormat(cur.dateTo, DATE_TIME_FORMAT);                    
                }
                periods.push(cur);
            }
            callback(null, periods);
        }
    });
}

/**
 * Function for terminating current period
 * @param  {[int]}   curPeriod [current period id]
 * @param  {Function} callback  [description]
 * @return {[type]}             [description]
 */
function finishCurPeriod(curPeriod, callback){
    console.log('api.finishCurPeriod with curPriod = '+curPeriod);
    getConnection();
    var dateTo = new Date();
    var dateToStr = dateFormat(dateTo, 'yyyy-mm-dd HH:MM:ss');
    var sql = "UPDATE periods SET dateTo = ? WHERE id = ?";
    connection.query(sql, [dateToStr, curPeriod], function(err, rows, fields){
        if (err){
            console.log('api.finishCurPeriod error: '+err);
            callback(err, null);
        }else{
            console.log('api.finishCurPeriod successfully');
            callback(null, 'period closed.');
        }
    });
}

/**
 * Function for inserting new period in DB
 * @param {[type]}   dateFrom [start date of the new period]
 * @param {Function} callback [description]
 */
function addNewPeriod(periodName, dateFrom, callback){
    // console.log('api.finishCurPeriod with curPriod = '+curPeriod);
    getConnection();
    var dateFromStr = dateFormat(dateFrom, 'yyyy-mm-dd HH:MM:ss');
    console.log('api.addNewPeriod dateFromStr = '+dateFromStr);
    var sql = "INSERT into periods (name, dateFrom, dateTo) VALUES (?, ?, null) ";
    connection.query(sql, [periodName, dateFromStr], function(err, rows, fields){
        if (err){
            console.log('api.finishCurPeriod error: '+err);
            callback(err, null);
        }else{
            callback(null, 'new period successfully inserted.');
        }
    });
}

/**
 * Function for reading plans for selected period
 * @param callback
 */
function readPlans(periodId, callback){
    getConnection();
    var result = [];
    var allCategories = [];
    var planPart = {};
    var chargePart = {};
    var sql = "SELECT p.categoryId, c.Name as categoryName, value as money from plan p, categories c WHERE c.id = p.categoryId AND periodId = ? ORDER BY money desc "

    connection.query(sql, [periodId], function(err, rows, fields){
        if (err){
            console.log('api.readPlans (plan table) error: '+err);
            callback(err, null);
        }else{
            console.log('api.readPlans.plans = '+JSON.stringify(rows));
            for (var i in rows){
                var cur = rows[i];
                planPart[cur.categoryId] = cur.money;
                allCategories.push({categoryId: cur.categoryId, categoryName: cur.categoryName});
            }
            sql =  " SELECT ch.Category_id as categoryId, c.Name as categoryName, sum(Money) as money "
                    +" FROM charges ch, periods per, categories c "
                    +" WHERE c.id = ch.Category_id "
                    +" AND ch.Date >= per.dateFrom AND ch.Date <= IFNULL(per.dateTo, CURDATE()+1) AND per.id = ? "
                    +" GROUP BY ch.Category_id "
                    +" ORDER BY money desc ";
            connection.query(sql, [periodId], function(err, rows, fields){
                if (err){
                    console.log('api.readPlans (charge table) error: '+err);
                    callback(err, null);      
                }else{
                    for (var i in rows){
                        var cur = rows[i];
                        chargePart[cur.categoryId] = cur.money;
                        if (!(cur.categoryId in planPart)){
                            if (cur.categoryName !== 'Пополнение'){
                                allCategories.push({categoryId: cur.categoryId, categoryName: cur.categoryName});                                
                            }

                        }
                    }
                }
                //union plans and charge parts
                for (var i in allCategories){
                    var curCategory = allCategories[i];
                    var resultRow = {"categoryId": curCategory.categoryId, "categoryName": curCategory.categoryName, "planned": 0, "spend": 0};
                    if (curCategory.categoryId in planPart){
                        resultRow["planned"] = planPart[curCategory.categoryId];
                    }
                    if (curCategory.categoryId in chargePart){
                        resultRow["spend"] = chargePart[curCategory.categoryId];
                    }
                    result.push(resultRow);
                }
                console.log('api readPlans');
                console.log(result);
                callback(null, result);
            });
        }
    });
}

/**
 * Function for inserting new plan entry in DB
 * @param {[type]}   dateFrom [start date of the new period]
 * @param {Function} callback [description]
 */
function addNewPlan(period, categoryId, money, callback){
    console.log('api.addNewPlan : period = '+period+'; categoryId = '+categoryId+'; money = '+money);
    getConnection();
    var sql = "INSERT into plan (periodId, categoryId, value) VALUES (?, ?, ?) ";
    connection.query(sql, [period, categoryId, money], function(err, rows, fields){
        if (err){
            console.log('api.addNewPlan error: '+err);
            callback(err, null);
        }else{
            callback(null, 'new plan entry successfully inserted.');
        }
    });
}

/**
 * Function for inserting new plan entry in DB
 * @param {[type]}   dateFrom [start date of the new period]
 * @param {Function} callback [description]
 */
function updatePlan(period, categoryId, money, callback){
    console.log('api.updatePlan : period = '+period+'; categoryId = '+categoryId+'; money = '+money);
    getConnection();
    var sql = "update plan set value = ? where periodId = ? and categoryId = ? ";
    connection.query(sql, [money, period, categoryId], function(err, rows, fields){
        if (err){
            console.log('api.updatePlan error: '+err);
            callback(err, null);
        }else{
            callback(null, 'new plan entry successfully inserted.');
        }
    });
}

function checkPresent(data){
    if (typeof data === 'undefined' || data === null){
        return null;
    }else{
        return data;
    }
}

function checkEmpty(data){
    if (typeof data === 'undefined' || data === null || data === ''){
        return null;
    }else{
        return data;
    }
}