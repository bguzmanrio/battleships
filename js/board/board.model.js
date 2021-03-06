/**
 * Represents the model of the application board.
 * @namespace Battleship.Board.Model
 * @memberOf Battleship.Board
 */
Battleship.Board.Model = {};

(function(){
    
    /**
     * Creates the model of the battleship board.
     * @memberOf Battleship.Board.Model
     */
    this.createBoardModel = function(options){
        return new BoardModel(options);
    }
    
    /**
     * Constructor for the battleship board model
     * @constructor
     * @memberOf Battleship.Board.Model
     */
    var BoardModel = Backbone.Model.extend({
       
        /**
         * Places a ship horizontally in the board model.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {object} startPosition - The starting cell for placing the ship.
         * @param {object} ship - The ship to be placed.
         * @returns {boolean} If the ship fits.
         */
        placeHorizontal: function(startPosition, ship){
            var nextOccupiedColumns = [];
            var board = this;
            var position;
            
            position = this.getShipIndex(startPosition);
            nextOccupiedColumns = this.getShipFits(startPosition, ship);
            if(nextOccupiedColumns){
                storePositions();
            }
            
            return nextOccupiedColumns.length > 0;
            
            function storePositions(){
                for(var i = 0; i<nextOccupiedColumns.length; i++){
                    board.occupyCell(position.rowIndex, nextOccupiedColumns[i])
                }
            };
        },
        
        /**
         * Places a ship vertically in the board model.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {object} startPosition - The starting cell for placing the ship.
         * @param {object} ship - The ship to be placed.
         * @returns {boolean} If the ship fits.
         */
        placeVertical: function(startPosition, ship){
            var nextOccupiedRows = [];
            var board = this;
            var position;
            
            position = this.getShipIndex(startPosition);
            nextOccupiedRows = this.getShipFits(startPosition, ship);
            if(nextOccupiedRows){
                storePositions();
            }
            
            return nextOccupiedRows.length > 0;
            
            function storePositions(){
                for(var i = 0; i<nextOccupiedRows.length; i++){
                    board.occupyCell(nextOccupiedRows[i], position.startIndex)
                }
            };
        },
        
        getShipIndex: function(startPosition){
            return {
                startIndex: startPosition.index(),
                rowIndex: startPosition.parent().index()
            }
        },
        
        /**
         * Checks wether the ship fits dependending on its length and direction.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {object} startPosition - The starting cell for placing the ship.
         * @param {object} ship - The ship to be checked.
         * @returns {array} The positions that will be occupied.
         */
        getShipFits: function(startPosition, ship){
            var nextOccupied = [];
            var position; 
            var isValidPosition = true;
            var board = this;
            var direction;
            var maxCells;
            var endIndex;
            var shipLength;
            var isOccupied;
            var maxCellsByDirection = {
                'horizontal' : board.get('nColumns'),
                'vertical': board.get('nRows')
            };
            
            var checkFunctions = {
                'horizontal' : function(index){
                    return board.isCellOccupied(position.rowIndex, index);
                },
                'vertical': function(index){
                    return board.isCellOccupied(index, position.startIndex);
                }
            };
            
            var checkMaxLengthFunctions = {
                'horizontal': function(){
                    return position.startIndex + shipLength;
                },
                'vertical': function(){
                    return position.rowIndex + shipLength;
                }
            };
            
            var addPositionFunctions = {
                'horizontal': function(i){
                    nextOccupied.push(position.startIndex + i);
                },
                'vertical': function(i){
                    nextOccupied.push(position.rowIndex + i);
                }
            }
            
            getDirection();
            getShipLength();
            position = this.getShipIndex(startPosition);
            getMaxCells();
            getPositionsToOccupy();
            checkPositions();
            getResultPositions();
            
            return nextOccupied;

            function getDirection(){
                direction = ship.get('direction');
            };
            
            function getShipLength(){
                shipLength = ship.get('length');
            }
            
            function getMaxCells(){
                maxCells = maxCellsByDirection[direction];
                endIndex = checkMaxLengthFunctions[direction]();
            };
            
            function getPositionsToOccupy(){
                for(var i = 0 ; i<shipLength ; i++){
                    addPositionFunctions[direction](i);
                }
            };
            
            function checkPositions(){
                for(var i = 0; i<nextOccupied.length && isValidPosition; i++){
                    isOccupied = checkFunctions[direction](nextOccupied[i]);
                    checkPositionId();
                }
                isValidPosition &= endIndex <= maxCells;
                return isValidPosition;
            };
            
            function checkPositionId(){
                if(isOccupied === ship.cid){
                    isValidPosition = true;
                }else if(isOccupied === false){
                    isValidPosition = true;
                }else{
                    isValidPosition = false;
                }
            }
            
            function getResultPositions(){
                if(!isValidPosition){
                    nextOccupied = false;
                }
            };
        },
        
        /**
         * Marks a cell as occupied by a ship.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        occupyCell: function(rowIndex, columnIndex){
            var shipId = this.get('shipToBePlaced').cid;
            var row;
            var ship;
            var board = this;
            
            addOccupiedPosition();
            addShipPosition();
            
            
            function addOccupiedPosition(){
                row = board.get('occupiedPositions')[rowIndex];
                if(!row){
                    row = board.get('occupiedPositions')[rowIndex] = {};
                }
                row[columnIndex] = shipId;
            };
            
            function addShipPosition(){
                var shipsPositions = board.get('shipPositionIndex') || {};
                ship = shipsPositions[shipId];
                if(!ship){
                    ship = [];
                }
                ship.push({
                    rowIndex: rowIndex,
                    columnIndex: columnIndex,
                    hit: false
                });
                shipsPositions[shipId] = ship;
                board.set('shipPositionIndex', shipsPositions);
            }
        },
        
        /**
         * Marks a cell as it has been fired.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        addToFiredCells: function(rowIndex, columnIndex){
            var row;
            var ship;
            
            row = this.get('firedPositions')[rowIndex];
            if(!row){
                row = this.get('firedPositions')[rowIndex] = {};
            }
            row[columnIndex] = true;
        },
        
        /**
         * Marks a cell as it has been fired and it contains a ship
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        addToHitCells: function(rowIndex, columnIndex){
            var row;
            var ship;
            
            row = this.get('hitPositions')[rowIndex];
            if(!row){
                row = this.get('hitPositions')[rowIndex] = {};
            }
            row[columnIndex] = true;
        },
        
        /**
         * Adds a damage point to a ship placed in the model of the board
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {string} shipid - Ship id.
         * @param {object} position - Position of the clicked cell.
         */
        addHitToShip: function(shipId, position){
            var collection = this.dispatcher.getPlacedCollection();
            var ship = collection.get(shipId);
            ship.addDamage(position);
            if(ship.isDestroyed()){
                console.log("ship destroyed");
                this.dispatcher.addDestroyedShip(ship);
            }
        },
        
        freeCell: function(rowIndex, columnIndex){
            var row = this.get('occupiedPositions')[rowIndex];
            if(row){
                delete row[columnIndex];
            }
        },
        
        /**
         * Checks if a cell has been occupied before.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        isCellOccupied: function(rowIndex, columnIndex){
            var row = this.get('occupiedPositions')[rowIndex] || {};
            var cell = row[columnIndex] || false;
            return cell;
        },
        
        /**
         * Checks if a cell has been fired. before
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        isCellFired: function(rowIndex, columnIndex){
            var row = this.get('firedPositions')[rowIndex] || {};
            var cell = row[columnIndex] || false;
            return cell;
        },
        
        /**
         * Checks if a cell has been hit before, due to it contains a ship 
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {number} rowIndex - Row index
         * @param {number} columnIndex - Column index
         */
        isCellHit: function(rowIndex, columnIndex){
            var row = this.get('hitPositions')[rowIndex] || {};
            var cell = row[columnIndex] || false;
            return cell;
        },
        
        getShipPositions: function(id){
            return this.get('shipPositionIndex')[id];
        },

        deleteShipPositions: function(id){
            delete this.get('shipPositionIndex')[id];
        },
        
        /**
         * Makes a random shoot based in the chosen difficulty .
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {string} diff - Selected difficulty.
         */
        autoFire: function(diff){
            var enemyBoard = this.dispatcher.getPlayerBoard();
            var difficulty = diff || this.get('difficulty');
            var functionToApply = this.autoFireFunctions[difficulty];
            var result = functionToApply.apply(this, [enemyBoard]);
            if(result.impact){
                this.dispatcher.autoFire();
            }else{
                result.cell.addClass('fired');
            }
            return result;
        },
        
        autoFireFunctions: {
            /**
             * Performs a soft attack, completely random.
             * @memberOf Battleship.Board.Model.BoardModel
             * @param {object} enemyBoard - Enemy's board view and model.
             * @returns {object} The cell shot and the result
             */
            easy: function(enemyBoard){
                var alreadyFired = true;
                var randomCell;
                var impact;
                var position;
                var board = this;
                
                getCell();
                fire();
                
                return {cell: randomCell, impact: impact};
                
                function getCell(){
                    randomCell = enemyBoard.view.getRandomCell();
                };
                
                function fire(){
                    impact = enemyBoard.view.fireAtCell(randomCell, 'Enemy');
                };
            },
            /**
             * Performs a soft attack, completely random, but based in the last hit position.
             * @memberOf Battleship.Board.Model.BoardModel
             * @param {object} enemyBoard - Enemy's board view and model.
             * @returns {object} The cell shot and the result
             */
            medium: function(enemyBoard){
                var lastFired = this.get('lastFire') || {};
                var lastFiredPosition = lastFired.cell;
                var result;
                var cell = {};
                var board = this;
                var impact;
                
                if(lastFired.impact){
                    while(!cell.length){
                        cell = this.getCellAlternatively(enemyBoard);
                    }
                }else{
                    cell = enemyBoard.view.getRandomCell();
                }
                
                fire();
                
                
                return result;
        
                function getRandomCell(){
                    var availableCells = this.$('.js-board-cell:not(.fired):not(.hit)');
                    var randomCell;
                    var randomCellPosition = Math.random()*availableCells.length;
                    randomCellPosition = Math.floor(randomCellPosition);
                    randomCell = $(availableCells.get(randomCellPosition));
                }
                
                function fire(){
                    impact = enemyBoard.view.fireAtCell(cell, 'Enemy');
                    result = {cell:cell, impact: impact};
                    board.set('lastFire', result);
                };
                
            },
            
            /**
             * Performs a soft attack, with a high probability of checking the known positions of the enemy's ships.
             * @memberOf Battleship.Board.Model.BoardModel
             * @param {object} enemyBoard - Enemy's board view and model.
             * @returns {object} The cell shot and the result
             */
            hard: function(enemyBoard){
                var lastFired = this.get('lastFire') || {};
                var result;
                var cell = {};
                var board = this;
                var impact;
                
                if(lastFired.impact){
                    while(!cell.length){
                        cell = this.getCellAlternatively(enemyBoard);
                    }
                }else{
                    getNotSoRandomCell();
                }
                
                fire();
                
                
                return result;
                
                function getNotSoRandomCell(){
                    var mustUseRandom = Math.random()*100;
                    if(mustUseRandom<40){
                        cell = enemyBoard.view.getRandomCell();
                    }else{
                        cell = board.getKnownPosition(enemyBoard);
                    }
                };
                
                function fire(){
                    impact = enemyBoard.view.fireAtCell(cell, 'Enemy');
                    result = {cell:cell, impact: impact};
                    board.set('lastFire', result);
                };
            },
            /**
             * Performs 1 to 10 attacks each one with a random difficulty between easy, medium and hard.
             * @memberOf Battleship.Board.Model.BoardModel
             * @param {object} enemyBoard - Enemy's board view and model.
             * @returns {object} The cell shot and the result
             */
            cheater: function(enemyBoard){
                var nAttacks;
                var attackType;
                var functionToApply;
                var result = {};
                var availableAttacks = ['easy','medium','hard'];
                var hit = true;
                
                getAttacks();
                for(var i = 0; i<nAttacks; i++){
                    getAttackType();
                    functionToApply = this.autoFireFunctions[attackType];
                    while(hit){
                        result = functionToApply.apply(this,[enemyBoard]);
                        hit = result.impact;
                    }
                    hit = true;
                    result.cell.addClass('fired');
                }
                
                return result;
                
                function getAttacks(){
                    nAttacks = 1 + parseInt(Math.random()*10000)%10;
                };
                
                function getAttackType(){
                    var randomAttack = parseInt(Math.random()*10000)%3;
                    attackType = availableAttacks[randomAttack];
                }
            }
        },
        
        /**
         * Gets a cell based in the last hit cell.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {object} enemyBoard - Enemy's board view and model.
         * @returns {object} The cell to be shot
         */
        getCellAlternatively: function(enemyBoard){
            var randomDirection = parseInt(Math.random()*10000)%4;
            var isAlreadyFired = true;
            var auxFiredPosition;
            var position;
            var lastFired = this.get('lastFire') || {};
            var lastFiredPosition = lastFired.cell;
            var n = 0;

            while(isAlreadyFired && n<4){
                n++;
                auxFiredPosition = getCellByDirection(randomDirection);
                if(auxFiredPosition){
                    position = enemyBoard.model.getShipIndex(auxFiredPosition);
                    isAlreadyFired = enemyBoard.model.isCellFired(position.rowIndex, position.startIndex);
                    if(enemyBoard.model.isCellHit(position.rowIndex, position.columnIndex)){
                        lastFiredPosition = auxFiredPosition;
                    }
                }                    
            }
            
            if(n >= 4 && isAlreadyFired){
                auxFiredPosition = enemyBoard.view.getRandomCell();
            }
            
            return auxFiredPosition;
            
            function getCellByDirection(randomDirection){
                var nextCell = lastFiredPosition;
                var cell;
                var index;
                if(randomDirection === 1 || randomDirection === 3){
                    index = nextCell.index();
                    nextCell = nextCell.parent();
                    if(randomDirection === 1){
                        nextCell = nextCell.next();
                    }else{
                        nextCell = nextCell.prev();
                    }
                    cell = nextCell.children()[index] || {};
                }else{
                    if(randomDirection === 0){
                        cell = nextCell.next() || {};
                    }else{
                        cell = nextCell.prev() || {};
                    }
                }
                return $(cell);
            };
        },
        
        /**
         * Gets a cell using a known position.
         * @memberOf Battleship.Board.Model.BoardModel
         * @param {object} enemyBoard - Enemy's board view and model.
         * @returns {object} The cell to be shot
         */
        getKnownPosition: function(enemyBoard){
            var availableShips = enemyBoard.model.get('shipPositionStringIndex');
            var randomPosition = parseInt(Math.random()*10000)%availableShips.length || 0;
            var shipPosition = availableShips[randomPosition] || "";
            var ship = shipPosition.split('|') || [];
            var selectedRow = enemyBoard.view.$('.container_10_bs').get(ship[0]);
            var selectedCell = $(selectedRow).find('.js-board-cell').get(ship[1]);
            
            return $(selectedCell);
        },
        
        createPositionIndex: function(){
            this.createShipPositionIndex();
            this.createEmptyPositionIndex();
        },
        
        createShipPositionIndex: function(){
            var positionsById = this.get('shipPositionIndex');
            var positionsArray = [];
            $.each(positionsById, function(pos, value){
                var currentArray = value;
                var currentPosition;
                var auxString = "";
                
                for(var i = 0; i<currentArray.length ; i++ ){
                    currentPosition = currentArray[i];
                    auxString = currentPosition.rowIndex + "|" + currentPosition.columnIndex;
                    positionsArray.push(auxString);
                }
            });
            this.set('shipPositionStringIndex', positionsArray);
        },
    
        createEmptyPositionIndex: function(){
            var positionsArray = [];
            var shipPositionArray = this.get('shipPositionStringIndex');
            var columns = this.get('nColumns');
            var rows = this.get('nRows');
            var auxPosition;
            for(var i = 0; i<rows ; i++){
                 for(var j = 0; j<columns ; j++){
                     auxPosition = i + '|' + j;
                     if(shipPositionArray.indexOf(auxPosition) < 0){
                         positionsArray.push(auxPosition);
                     }
                 }
            }
            
            this.set('emptyPositionIndex', positionsArray);
                
        },
        
        removeFromStringIndex: function(row, column, index){
            var positionsArray = this.get(index);
            if(positionsArray){
                var auxString = row+'|'+column;
                var index = positionsArray.indexOf(auxString);
                positionsArray.splice(index,1);
                this.set(index, positionsArray);
            }
            
        }
    });

}).apply(Battleship.Board.Model);