var getContext = function(display, infos) {

    var language_strings = {
        en: {
            categories: {
                database: 'Database'
            },
            label: {
                loadTable: 'loadTable(%1)',
                loadTableFromCsv: 'loadTableFromCsv(%1, %2)',
                getRecords: 'getRecords(%1)',
                selectByColumn: 'selectByColumn(%1, %2, %3)',
                selectByFunction: 'selectByFunction(%1, %2)',
                selectTopRows: 'selectTopRows(%1, %2)',
                getColumn: 'getColumn(%1, %2)',
                sortByColumn: 'sortByColumn(%1, %2, %3)',
                sortByFunction: 'sortByFunction(%1, %2)',
                selectColumns: 'selectColumns(%1, %2)',
                joinTables: 'joinTables(%1, %2, %3, %4, %5)',
                displayTable: 'displayTable(%1, %2)',
                updateWhere: 'updateWhere(%1, %2, %3)',
                insertRecord: 'insertRecord(%1, %2)',
                unionTables: 'unionTables(%1, %2)',
                displayRecord: 'displayRecord(%1)',
                displayTableOnMap: 'displayTableOnMap(%1, %2, %3, %4)'
            },
            code: {
                loadTable: 'loadTable',
                loadTableFromCsv: 'loadTableFromCsv',
                getRecords: 'getRecords',
                selectByColumn: 'selectByColumn',
                selectByFunction: 'selectByFunction',
                selectTopRows: 'selectTopRows',
                getColumnL: 'getColumn',
                sortByColumn: 'sortByColumn',
                sortByFunction: 'sortByFunction',
                selectColumns: 'selectColumns',
                joinTables: 'joinTables',
                displayTable: 'displayTable',
                updateWhere: 'updateWhere',
                insertRecord: 'insertRecord',
                unionTables: 'unionTables',
                displayRecord: 'displayRecord',
                displayTableOnMap: 'displayTableOnMap'
            },
            description: {
/*                loadTable: 'loadTable',
                loadTableFromCsv: 'loadTableFromCsv',
                getRecords: 'getRecords',
                selectByColumn: 'selectByColumn',
                selectByFunction: 'selectByFunction',
                selectTopRows: 'selectTopRows',
                getColumnL: 'getColumn',
                sortByColumn: 'sortByColumn',
                sortByFunction: 'sortByFunction',
                selectColumns: 'selectColumns',
                joinTables: 'joinTables',
                displayTable: 'displayTable',
                updateWhere: 'updateWhere',
                insertRecord: 'insertRecord',
                unionTables: 'unionTables',
                displayRecord: 'displayRecord',
                displayTableOnMap: 'displayTableOnMap'*/
            },
            startingBlockName: "Programme",
            constantLabel: {
                asc: 'asc',
                desc: 'desc',
                inner: 'inner',
                outer: 'outer',
                left: 'left',
                right: 'right'
            },
            messages: {
                tableNotFound: 'Table not found: ',
                invalidResult: ''
            },
            ui: {
                'btn_files_repository': 'Add CSV files...',
                'files_repository': {
                    'caption': 'CSV files list',
                    'hint': 'Use file number as param for loadTableFromCsv function. Allowed CSV files with ; delimiter only.',
                    'add': 'Add',
                    'incompatible_browser': 'Incompatible browser'
                }
            }
        },
        fr: {
            categories: {
                database: 'Base de données'
            },
            label: {
                loadTable: 'loadTable(%1)',
                loadTableFromCsv: 'loadTableFromCsv(%1, %2)',
                getRecords: 'getRecords(%1)',
                selectByColumn: 'selectByColumn(%1, %2, %3)',
                selectByFunction: 'selectByFunction(%1, %2)',
                selectTopRows: 'selectTopRows(%1, %2)',
                getColumn: 'getColumn(%1, %2)',
                sortByColumn: 'sortByColumn(%1, %2, %3)',
                sortByFunction: 'sortByFunction(%1, %2)',
                selectColumns: 'selectColumns(%1, %2)',
                joinTables: 'joinTables(%1, %2, %3, %4, %5)',
                displayTable: 'displayTable(%1, %2)',
                updateWhere: 'updateWhere(%1, %2, %3)',
                insertRecord: 'insertRecord(%1, %2)',
                unionTables: 'unionTables(%1, %2)',
                displayRecord: 'displayRecord(%1)',
                displayTableOnMap: 'displayTableOnMap(%1, %2, %3, %4)'
            },
            code: {
                loadTable: 'loadTable',
                loadTableFromCsv: 'loadTableFromCsv',
                getRecords: 'getRecords',
                selectByColumn: 'selectByColumn',
                selectByFunction: 'selectByFunction',
                selectTopRows: 'selectTopRows',
                getColumnL: 'getColumn',
                sortByColumn: 'sortByColumn',
                sortByFunction: 'sortByFunction',
                selectColumns: 'selectColumns',
                joinTables: 'joinTables',
                displayTable: 'displayTable',
                updateWhere: 'updateWhere',
                insertRecord: 'insertRecord',
                unionTables: 'unionTables',
                displayRecord: 'displayRecord',
                displayTableOnMap: 'displayTableOnMap'
            },
            description: {
                loadTable: 'loadTable',
                loadTableFromCsv: 'loadTableFromCsv',
                getRecords: 'getRecords',
                selectByColumn: 'selectByColumn',
                selectByFunction: 'selectByFunction',
                selectTopRows: 'selectTopRows',
                getColumnL: 'getColumn',
                sortByColumn: 'sortByColumn',
                sortByFunction: 'sortByFunction',
                selectColumns: 'selectColumns',
                joinTables: 'joinTables',
                displayTable: 'displayTable',
                updateWhere: 'updateWhere',
                insertRecord: 'insertRecord',
                unionTables: 'unionTables',
                displayRecord: 'displayRecord',
                displayTableOnMap: 'displayTableOnMap'
            },
            startingBlockName: "Programme",
            constantLabel: {
                asc: 'asc',
                desc: 'desc',
                inner: 'inner',
                outer: 'outer',
                left: 'left',
                right: 'right'
            },
            messages: {
                tableNotFound: 'Table non trouvée: ',
                invalidResult: ''
            },
            ui: {
                'btn_files_repository': 'Ajouter des CSV...',
                'files_repository': {
                    'caption': 'Liste de fichiers CSV',
                    'hint': 'Utiliser le numéro de fichier comme paramètre de la fonction loadTableFromCsv. Seuls les fichiers CSV utilisant ; comme délimiteur de champs sont acceptés.',
                    'add': 'Ajouter',
                    'incompatible_browser': 'Navigateur incompatible avec cette fonctionnalité'
                }
            }
        }
    }



    var context = quickAlgoContext(display, infos)
    var strings = context.setLocalLanguageStrings(language_strings)
    var task_tables = {};
    var files, db_helper;
    var ready = false;

    context.reset = function(taskInfos) {
        if(!context.display) return;

        if(taskInfos) {
            task_tables = taskInfos.tables || {};
        }

        if(ready) return;
        ready = true;

        files = new FilesRepository({
            extensions: '.csv',
            parent: $('#taskContent'),
            strings: strings.ui.files_repository
        });

        db_helper = new DatabaseHelper(
            Object.assign({
                parent: $('#grid')
            }, infos.databaseConfig)
        );


        var html =
            '<div id="database_controls">' +
                '<button class="btn btn-xs" style="float: right" id="btn_files">' + strings.ui.btn_files_repository + '</button>' +
            '</div>';
        $('#testSelector').prepend($(html))
        $('#btn_files').click(function() {
            files.show();
        })


        /*
        //test html render
        context.database.loadTable('test_table', function(table, callback) {
            context.database.displayTable(table, null, function() {
                context.expectTable('valid_table')
            });
        })
*/
/*
        //test map render
        setTimeout(function() {
            context.database.loadTable('test_table2', function(table, callback) {
                context.database.displayTableOnMap(table, 'city', 'lng', 'lat', function() {
                    context.expectTable('valid_table2');
                });

            })
        }, 500)
*/


    }


    context.setScale = function(scale) {}
    context.updateScale = function() {}
    context.resetDisplay = function() {}
    context.unload = function() {}
    context.changeDelay = function(actionDelay) {}
    context.onExecutionEnd = function() {}


    context.expectTable = function(name) {
        if(name in task_tables) {
            var table = Table(task_tables[name]);
            db_helper.validateResult(table);
        } else {
            console.error('Undefined table: ' + name)
        }
    }


    context.database = {

        loadTable: function(name, callback) {
            if(!task_tables[name]) throw new Error(strings.messages.tableNotFound + name);
            context.runner.noDelay(callback, Table(task_tables[name]));
        },


        loadTableFromCsv: function(fileNumber, types, callback) {
            var file = files.getFile(fileNumber - 1);
            var types_arr = Array.from(types.properties);
            db_helper.loadCsv(file, types_arr, function(table) {
                context.runner.noDelay(callback, table);
            });
        },

        getRecords: function(table, callback) {
            context.runner.noDelay(callback, table.getRecords());
        },

        selectByColumn: function(table, columnName, value, callback) {
            context.runner.noDelay(callback, table.selectByColumn(columnName, value));
        },

        selectByFunction: function(table, filterFunction, callback) {
            context.runner.noDelay(callback, table.selectByFunction(filterFunction));
        },

        selectTopRows: function(table, amount, callback) {
            context.runner.noDelay(callback, table.selectTopRows(amount));
        },

        getColumn: function(record, columnName, callback) {
            if(columnName in record) {
                context.runner.noDelay(callback, record[columnName]);
            } else {
                throw new Error('Column ' + columnName + ' not found');
            }
        },

        sortByColumn: function(table, columnName, direction, callback) {
            context.runner.noDelay(callback, table.sortByColumn(columnName, direction));
        },

        sortByFunction: function(table, compareFunction, callback) {
            context.runner.noDelay(callback, table.sortByFunction(compareFunction));
        },

        selectColumns: function(table, columns, callback) {
            context.runner.noDelay(callback, table.selectColumns(columns));
        },

        joinTables: function(table1, column1, table2, column2, type, callback) {
            context.runner.noDelay(callback, table1.join(column1, table2, column2, type));
        },

        displayTable: function(table, columns, callback) {
            if(columns) {
                var columns_arr = Array.from(columns.properties);
                db_helper.displayTable(
                    table.selectColumns(columns_arr)
                )
            } else {
                db_helper.displayTable(table);
            }
            callback();
        },

        updateWhere: function(table, filterFunction, updateFunction, callback) {
            context.runner.noDelay(callback, table.updateWhere(filterFunction, updateFunction));
        },

        insertRecord: function(table, record, callback) {
            context.runner.noDelay(callback, table.insertRecord(record));
        },

        unionTables: function(table1, table2, callback) {
            context.runner.noDelay(callback, table1.union(table2));
        },

        displayRecord: function(record, callback) {
            var res = {
                columnNames: Object.keys(record),
                records: [
                    Object.values(record),
                ]
            }
            res.columnTypes = Array.apply(null, Array(res.records[0].length)).map(function() {
                return 'string';
            })
            var table = Table(res)
            db_helper.displayTable(table);
            context.runner.noDelay(callback);
        },


        displayTableOnMap: function(table, nameColumn, longitudeColumn, latitudeColumn, callback) {
            db_helper.displayTableOnMap(
                table.selectColumns([nameColumn, longitudeColumn, latitudeColumn]),
            );
            context.runner.noDelay(callback);
        }
    }



    context.customBlocks = {
        database: {
            database: [
                { name: 'loadTable',
                    params: ['String'],
                    params_names: ['table_name'],
                    yieldsValue: true
                },
                { name: 'loadTableFromCsv',
                    params: ['String', 'Block'],
                    params_names: ['file', 'columnTypes'],
                    yieldsValue: true
                },
                { name: 'getRecords',
                    params: ['Block'],
                    params_names: ['table'],
                    yieldsValue: true
                },
                { name: 'selectByColumn',
                    params: ['Block', 'String', 'String'],
                    params_names: ['table', 'columnName', 'value'],
                    yieldsValue: true
                },
                { name: 'selectByFunction',
                    params: ['Block', 'String'],
                    params_names: ['table', 'filterFunction'],
                    yieldsValue: true
                },
                { name: 'selectTopRows',
                    params: ['Block', 'Number'],
                    params_names: ['table', 'amount'],
                    yieldsValue: true
                },
                { name: 'getColumn',
                    params: ['String', 'String'],
                    params_names: ['record', 'columnName'],
                    yieldsValue: true
                },
                { name: 'sortByColumn',
                    params: ['Block', 'String', 'SortOrder'],
                    params_names: ['table', 'columnName', 'direction'],
                    yieldsValue: true
                },
                { name: 'sortByFunction',
                    params: ['Block', 'String'],
                    params_names: ['table', 'compareFunction'],
                    yieldsValue: true
                },
                { name: 'selectColumns',
                    params: ['Block', 'String'],
                    params_names: ['table', 'columns'],
                    yieldsValue: true
                },
                { name: 'joinTables',
                    params: ['Block', 'String', 'Block', 'String', 'JoinType'],
                    params_names: ['table', 'columnName', 'table', 'columnName', 'type'],
                    yieldsValue: true
                },
                { name: 'updateWhere',
                    params: ['Block', 'String', 'String'],
                    params_names: ['table', 'filterFunction', 'updateFunction'],
                    yieldsValue: true
                },
                { name: 'insertRecord',
                    params: ['Block', 'String'],
                    params_names: ['table', 'record'],
                    yieldsValue: true
                },
                { name: 'unionTables',
                    params: ['Block', 'Block'],
                    params_names: ['table', 'table'],
                    yieldsValue: true
                },
                { name: 'displayTable',
                    params: ['Block', 'Block'],
                    params_names: ['table', 'columns'],
                },
                { name: 'displayRecord',
                    params: ['Block'],
                    params_names: ['record']
                },
                { name: 'displayTableOnMap',
                    params: ['Block', 'String','String', 'String'],
                    params_names: ['table', 'nameColumn', 'longitudeColumn', 'latitudeColumn'],
                }
            ]
        }
    }

    var typeData = {
        'Number': { bType: 'input_value', vType: 'math_number', fName: 'NUM', defVal: 0 },
        'String': { bType: 'input_value', vType: 'text', fName: 'TEXT', defVal: '' },
        'Block': { bType: 'input_value', fName: 'BLOCK', defVal: '' },
        'SortOrder': { bType: 'field_dropdown', defVal: 'asc', options: [
            [strings.constantLabel.asc, 'asc'],
            [strings.constantLabel.desc, 'desc']
        ]},
        'JoinType': { bType: 'field_dropdown', defVal: 'inner', options: [
            [strings.constantLabel.inner, 'inner'],
            [strings.constantLabel.outer, 'outer'],
            [strings.constantLabel.left, 'left'],
            [strings.constantLabel.right, 'right']
        ]}
    }

    BlocksHelper.convertBlocks(context, 'database', typeData);

    return context;
}

if(window.quickAlgoLibraries) {
    quickAlgoLibraries.register('database', getContext);
} else {
    if(!window.quickAlgoLibrariesList) { window.quickAlgoLibrariesList = []; }
    window.quickAlgoLibrariesList.push(['database', getContext]);
}