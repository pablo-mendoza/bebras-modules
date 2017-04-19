/*
    blockly_runner:
        Blockly (translated into JavaScript) code runner, with highlighting and
        value reporting features.
*/

"use strict";

function initBlocklyRunner(context, messageCallback, language) {
   init(context, [], [], [], false, {}, language);

   function init(context, interpreters, isRunning, toStop, stopPrograms, runner, language) {
      runner.hasActions = false;
      runner.nbActions = 0;
      runner.scratchMode = context.blocklyHelper ? context.blocklyHelper.scratchMode : false;

      runner.stepInProgress = false;
      runner.stepMode = false;
      runner.nextCallBack = null;
      runner.firstHighlight = true;

      runner.strings = languageStrings[language];

      runner.reportBlockValue = function(id, value, varName) {
         // Show a popup displaying the value of a block in step-by-step mode
         if(context.display && runner.stepMode) {
            var displayStr = value.toString();
            if(value.type == 'boolean') {
               displayStr = value.data ? runner.strings.valueTrue : runner.strings.valueFalse;
            }
            if(varName) {
               varName = varName.toString();
               for(var dbIdx in Blockly.JavaScript.variableDB_.db_) {
                  if(Blockly.JavaScript.variableDB_.db_[dbIdx] == varName) {
                     varName = dbIdx.substring(0, dbIdx.length - 9);
                     break;
                  }
               }
               displayStr = varName + ' = ' + displayStr;
            }
            context.blocklyHelper.workspace.reportValue(id, displayStr);
         }
         return value;
      };
      
      runner.waitDelay = function(callback, value, delay) {
         if (delay > 0) {
            context.delayFactory.createTimeout("wait" + context.curRobot + "_" + Math.random(), function() {
                  runner.noDelay(callback, value);
               },
               delay
            );
         } else {
            runner.noDelay(callback, value);
         }
      };

      runner.noDelay = function(callback, value) {
         var primitive = undefined;
         if (value != undefined) {
            primitive = interpreters[context.curRobot].createPrimitive(value);
         }
         if (Math.random() < 0.1) {
            context.delayFactory.createTimeout("wait_" + Math.random(), function() {
               callback(primitive);
               runner.runSyncBlock();
            }, 0);
         } else {
            callback(primitive);
            runner.runSyncBlock();
         }
      };

      runner.initInterpreter = function(interpreter, scope) {
         var makeHandler = function(runner, handler) {
            // For commands belonging to the "actions" category, we count the
            // number of actions to put a limit on steps without actions
            return function () {
               runner.nbActions += 1;
               handler.apply(this, arguments);
            };
         };
         
         for (var objectName in context.customBlocks) {
            for (var category in context.customBlocks[objectName]) {
               for (var iBlock in context.customBlocks[objectName][category]) {
                  var blockInfo = context.customBlocks[objectName][category][iBlock];
                  var code = context.strings.code[blockInfo.name];
                  if (typeof(code) == "undefined") {
                     code = blockInfo.name;
                  }

                  if(category == 'actions') {
                     runner.hasActions = true;
                     var handler = makeHandler(runner, blockInfo.handler);
                  } else {
                     var handler = blockInfo.handler;
                  }
                  
                  interpreter.setProperty(scope, code, interpreter.createAsyncFunction(handler));
               }
            }            
         }
         
         
         /*for (var objectName in context.generators) {
            for (var iGen = 0; iGen < context.generators[objectName].length; iGen++) {
               var generator = context.generators[objectName][iGen];
               interpreter.setProperty(scope, objectName + "_" + generator.labelEn, interpreter.createAsyncFunction(generator.fct));
            }
         }*/
         interpreter.setProperty(scope, "program_end", interpreter.createAsyncFunction(context.program_end));

         function highlightBlock(id, callback) {
            id = id ? id.toString() : '';
            
            if (context.display) {
               if(!runner.scratchMode) {
                  context.blocklyHelper.workspace.traceOn(true);
                  context.blocklyHelper.workspace.highlightBlock(id);
                  highlightPause = true;
               } else {
                  context.blocklyHelper.glowBlock(id);
                  highlightPause = true;
               }
            }
            
            // We always execute directly the first highlightBlock
            if(runner.firstHighlight || !runner.stepMode) {
               runner.firstHighlight = false;
               callback();
               runner.runSyncBlock();
            } else {
               // Interrupt here for step mode, allows to stop before each
               // instruction
               runner.nextCallback = callback;
               runner.stepInProgress = false;
            }
         }

         // Add an API function for highlighting blocks.
         interpreter.setProperty(scope, 'highlightBlock', interpreter.createAsyncFunction(highlightBlock));

         // Add an API function to report a value.
         interpreter.setProperty(scope, 'reportBlockValue', interpreter.createNativeFunction(runner.reportBlockValue));
        
      };

      runner.stop = function() {
         for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
            if (isRunning[iInterpreter]) {
               toStop[iInterpreter] = true;
               isRunning[iInterpreter] = false;
            }
         }

         if(runner.scratchMode) {
            Blockly.DropDownDiv.hide();
            context.blocklyHelper.glowBlock(null);
         }
         
         context.reset();
      };

      runner.runSyncBlock = function() {
         var maxIter = 400000;

         var maxIterWithoutAction = 500;
         if (context.infos.maxIter != undefined) {
            maxIter = context.infos.maxIter;
         }
         if (context.infos.maxIterWithoutAction != undefined) {
            maxIterWithoutAction = context.infos.maxIterWithoutAction;
         }

         if(!runner.hasActions) {
            // If there's no actions in the current task, "disable" the limit
            maxIterWithoutAction = maxIter;
         }
   /*      if (turn > 90) {
            task.program_end(function() {
               that.stop();
            });
            return;
      }*/

         runner.stepInProgress = true;
         // Handle the callback from last highlightBlock
         if(runner.nextCallback) {
            runner.nextCallback();
            runner.nextCallback = null;
         }
         
         try {
            for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
               context.curRobot = iInterpreter;
               if (context.infos.checkEndEveryTurn) {
                  context.infos.checkEndCondition(context, false);
               }
               var interpreter = interpreters[iInterpreter];
               while (context.curSteps[iInterpreter].total < maxIter && context.curSteps[iInterpreter].withoutAction < maxIterWithoutAction) {
                  if (!interpreter.step() || toStop[iInterpreter]) {
                     isRunning[iInterpreter] = false;
                     break;
                  }
                  if (interpreter.paused_) {
                     break;
                  }
                  context.curSteps[iInterpreter].total++;
                  if(context.curSteps[iInterpreter].lastNbMoves != runner.nbActions) {
                     context.curSteps[iInterpreter].lastNbMoves = runner.nbActions;
                     context.curSteps[iInterpreter].withoutAction = 0;
                  } else {
                     context.curSteps[iInterpreter].withoutAction++;
                  }
               }
               if (context.curSteps[iInterpreter].total >= maxIter) {
                  isRunning[iInterpreter] = false;
                  throw context.blocklyHelper.strings.tooManyIterations;
               } else if(context.curSteps[iInterpreter].withoutAction >= maxIterWithoutAction) {
                  isRunning[iInterpreter] = false;
                  throw context.blocklyHelper.strings.tooManyIterationsWithoutAction;
               }
            }
         } catch (e) {
            runner.stepInProgress = false;
            
            for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
               isRunning[iInterpreter] = false;
            }

            var message = e.toString();

            // Translate "Unknown identifier" message
            if(message.substring(0, 20) == "Unknown identifier: ") {
               var varName = message.substring(20);
               // Get original variable name if possible
               for(var dbIdx in Blockly.JavaScript.variableDB_.db_) {
                  if(Blockly.JavaScript.variableDB_.db_[dbIdx] == varName) {
                     varName = dbIdx.substring(0, dbIdx.length - 9);
                     break;
                  }
               }
               message = strings.uninitializedVar + ' ' + varName;
            }
            
            if ((context.nbTestCases != undefined) && (context.nbTestCases > 1)) {
               if (context.success) {
                  message = context.messagePrefixSuccess + message;
               } else {
                  message = context.messagePrefixFailure + message;
               }
            }
            if (context.success) {
               message = "<span style='color:green;font-weight:bold'>" + message + "</span>"; 
               if (context.linkBack) {
                  //message += "<br/><span onclick='window.parent.backToList()' style='font-weight:bold;cursor:pointer;text-decoration:underline;color:blue'>Retour à la liste des questions</span>";
               }
            }
            messageCallback(message);
         }
      };

      runner.initCodes = function(codes) {
         //this.mainContext.delayFactory.stopAll(); pb: it would top existing graders
         interpreters = [];
         runner.nbActions = 0;
         runner.stepInProgress = false;
         runner.stepMode = false;
         runner.firstHighlight = true;
         context.programEnded = [];
         context.curSteps = [];
         context.reset();
         for (var iInterpreter = 0; iInterpreter < codes.length; iInterpreter++) {
            context.curSteps[iInterpreter] = {
               total: 0,
               withoutAction: 0,
               lastNbMoves: 0,
            };
            context.programEnded[iInterpreter] = false;
            interpreters.push(new Interpreter(codes[iInterpreter], runner.initInterpreter));
            isRunning[iInterpreter] = true;
            toStop[iInterpreter] = false;
         }
      };
      runner.runCodes = function(codes) {
         runner.initCodes(codes);
         runner.runSyncBlock();
      };

      runner.run = function () {
         runner.stepMode = false;
         if(!runner.stepInProgress) {
            for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
               interpreters[iInterpreter].paused_ = false;
            }
            runner.runSyncBlock();
         }
      };

      runner.step = function () {
         runner.stepMode = true;
         if(!runner.stepInProgress) {
            for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
               interpreters[iInterpreter].paused_ = false;
            }
            runner.runSyncBlock();
         }
      };


      runner.nbRunning = function() {
         var nbRunning = 0;
         for (var iInterpreter = 0; iInterpreter < interpreters.length; iInterpreter++) {
            if (isRunning[iInterpreter]) {
               nbRunning++;
            }
         }
         return nbRunning;
      };

      context.runner = runner;
      context.callCallback = runner.noDelay;
      context.programEnded = [];
   }
}