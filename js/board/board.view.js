/**
 * Represents the view of the application board.
 * @namespace Battleship.Board
 * @memberOf Battleship
 */
Battleship.Board = {};

(function(){
    "use strict";
    
    /**
     * Creates the view of the battleship board.
     * @memberOf Battleship.Board
     */
    this.createBoard = function(options){
        return new BattleshipBoardView(options);
    };
    

    /**
     * Constructor for the battleship board view
     * @constructor
     * @memberOf Battleship.Board
     */
    var BattleshipBoardView = Backbone.View.extend({
        
        mode: "place",
        
        events:{
            "click .js-ship": "selectShip",
            "click div>div:not(.js-ship)": "manageClick"
        },

        template: function(){
            var tpl = _.template($("#table_tpl").html());
            return tpl({columns: this.nColumns, rows: this.nRows, cellWidth: this.cellWidth});
        },
        
        initialize: function(options){
            this.setDefaultOptions(options);
            this.getSizes();
            this.render();
            if(this.renderShips){
                this.maximize();
            }
        },
        
        setDefaultOptions: function(options){
            this.auto = options.auto || false;
            this.renderShips = options.render || false;
            this.nRows = options.nRows || 10;
            this.nColumns = options.nColumns || 10;
            this.model.set('nRows', this.nRows);
            this.model.set('nColumns', this.nColumns);
            this.nShoots = 0;
        },
        
        /**
         * Get the size of both boards based on the width of the container.
         * @memberOf Battleship.Board.BattleshipBoardView
         */
        getSizes: function(){
            var sectionWidth = $('.js-main-container').width() - 20;
            var maxMapSize = sectionWidth * 0.7;
            var minMapSize = sectionWidth * 0.3;
            this.cellWidth = maxMapSize / this.nColumns;
            this.cellMinifiedWidth = minMapSize / this.nColumns;
        },
        
        /**
         * Maximizes the board.
         * @memberOf Battleship.Board.BattleshipBoardView
     * @param {object} $el - Board to maximize
         */
        maximize: function($el){
            
            var $elToApply = $el || this.$el;
            $elToApply.css("width", this.cellWidth * this.nColumns);
            $elToApply.css("height", this.cellWidth * this.nRows).find(".g_1_bs").css("height", this.cellWidth);
        },
        
        render: function(){
            this.$el.html(this.template());
            return this;
        },
        
        manageClick: function(e){
            this[this.mode](e);
        },
        
        /**
         * Places the ships randomly in the board
         * @memberOf Battleship.Board.BattleshipBoardView
         */
        placeShipAuto: function(){
            var randomCell;
            var direction;
            var i = 0;
            var collection = this.dispatcher.getCollection();
            var shipPlaced;
            var board = this;
            var ship;
            
            while(collection.models.length){
                ship = collection.models[0];
                board.prepareShip(ship);
                shipPlaced = false;
                placeShip();
                
            };
            
            function placeShip(){
                while(!shipPlaced){
                    randomCell = board.getRandomCell();
                    getRandomDirection();
                    ship.set('direction', direction);
                    shipPlaced = board.placeShip(randomCell, ship);
                }
            }
            
            function getRandomDirection(){
                var directionRandomBase = Math.random()*1000;
                if(directionRandomBase >= 500){
                    direction = 'vertical';
                }else{
                    direction = 'horizontal';
                }
            }
        },
        
        place: function(e){
            e.stopPropagation();
            this.placeShip($(e.target));
        }, 
        
        /**
         * Places a specific ship in a position.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} position - The new position of the ship
         * @param {object} newShip - The ship to be placed.
         * @returns {boolean} If the ship has been placed.
         */
        placeShip: function(position, newShip){
            var ship = newShip || this.model.get('shipToBePlaced')
            var startPosition = position;
            var board = this;
            var shipDirection;
            var placed;
            var shipPosition;
            
            if(ship){
                getPosition();
                getData();
                placeShip();
                if(placed){
                    drawShip();
                    deleteShip();
                }
            }
            
            return placed;
            
            function getPosition(){
                shipPosition = board.model.getShipIndex(startPosition);
            };
            
            function getData(){
                shipDirection = ship.get('direction');
            };
            
            function placeShip(){
                if(shipDirection === 'horizontal'){
                    placed = board.model.placeHorizontal(startPosition, ship);
                }else{
                    placed = board.model.placeVertical(startPosition, ship);
                }
            };
            
            function drawShip(){
                if(board.renderShips){
                    board.drawShip(ship, startPosition, shipPosition.startIndex);
                }
            };
            
            function deleteShip(){
                board.dispatcher.placedShip(ship);
                board.model.set('shipToBePlaced', "");
            }
        },
        
        /**
         * Adds the classes to the board html
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} ship - Ship to be drawn.
         * @param {object} startPosition - Start position of the ship.
         * @param {number} column - The index of the column in which will the ship be drawn (only for vertical ship).
         */
        drawShip: function(ship, startPosition, column){
            var shipDirection = ship.get('direction');
            var shipLength = ship.get('length');
            var id = ship.cid;
            
            if(shipDirection === 'horizontal'){
                this.drawHorizontal(shipLength, ship, id, startPosition);
            }else{
                this.drawVertical(shipLength, ship, id, startPosition, column)
            }
        },
        
        /**
         * Draws the ship vertically
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {number} shipLength - Length of the ship.
         * @param {object} ship - Ship model.
         * @param {string} id - The id of the ship model.
         * @param {object} startPosition - Start position of the ship.
         * @param {number} column - The index of the column in which will the ship be drawn.
         */
        drawVertical: function(shipLength, ship, id, startPosition, column){
            
            var shipClass;
            for(var i = 0; i<shipLength; i++){
                shipClass = ship.getClass(i)
                startPosition.addClass('js-ship ' + shipClass);
                startPosition.data("id", id);
                startPosition.attr("data-id", id);
                startPosition = $(startPosition.parent().next().children().get(column));
            }
        },
        
        /**
         * Draws the ship horizontally
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {number} shipLength - Length of the ship.
         * @param {object} ship - Ship model.
         * @param {string} id - The id of the ship model.
         * @param {object} startPosition - Start position of the ship.
         */
        drawHorizontal: function(shipLength, ship, id, startPosition){
            
            var shipClass;
            for(var i = 0; i<shipLength; i++){
                shipClass = ship.getClass(i)
                startPosition.addClass('js-ship ' + shipClass);
                startPosition.data("id", id);
                startPosition.attr("data-id", id);
                startPosition = startPosition.next();
            }
        },
        
        /**
         * Stores the ship which will be placed.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} ship - Ship to be stored.
         */
        prepareShip: function(ship){
            this.model.set('shipToBePlaced', ship);
        },        
        
        /**
         * Selects the ship in the cell clicked.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} e - Event of the click.
         */
        selectShip: function(e){
            var startIndex;
            var rowIndex;
            var shipSelected;
            var cell = $(e.target);
            var board = this;
            
            getIndex();
            getSelectedShip();
            setSelectedShip();
            
            function getIndex(){
                var index = board.getIndexSelected(cell);
                startIndex = index.startIndex;
                rowIndex = index.rowIndex;
            };
            
            function getSelectedShip(){
                shipSelected = board.model.isCellOccupied(rowIndex, startIndex);
            };
            
            function setSelectedShip(){
                board.dispatcher.selectPlacedShip(shipSelected)
            };
        },
        
        /**
         * Gets the row and the colum index for a cell.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} cell - Cell to get index from
         * @returns {object} Column and row index of the cell.
         */
        getIndexSelected: function(cell){
              return {
                  startIndex: cell.index(),
                  rowIndex: cell.parent().index()
              }
        },
        
        /**
         * Deletes the selected ship.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} ship - Ship to be deleted.
         */
        deleteShip: function(ship){
            var shipClass = ship.getClass();
            var shipId = ship.cid;
            var positions = this.model.getShipPositions(shipId);
            var position;
            var board = this;
            
            clearCells();
            clearBoard();
            
            function clearCells(){
                for(var i = 0; i<positions.length; i++){
                    position = positions[i];
                    board.model.freeCell(position.rowIndex, position.columnIndex);
                }
                board.model.deleteShipPositions(shipId);
            };
            
            function clearBoard(){
                board.$('[data-id=' + shipId + ']').removeClass(shipClass + ' js-ship');    
            };            
        },
    
        getPlacedShipPosition: function(shipId){
            return $(this.$('[data-id=' + shipId + ']').get(0));
        },
        
        /**
         * Minimizes the board
         * @memberOf Battleship.Board.BattleshipBoardView
         */
        minimize: function(){
            this.$el.css('width',this.cellMinifiedWidth * this.nColumns );
            this.$el.css('height',this.cellMinifiedWidth * this.nRows );
            this.$('.js-board-cell').css('height', this.cellMinifiedWidth);
            this.$el.parent().addClass('clickable');
        },
        
        /**
         * Displays the user's board in a modal window.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} e - Click event.
         */
        showModalBoard: function(e){
            var $el = this.$el.clone();
            var $modal = $('#modal');
            var $modalDialog = $modal.find('.modal-dialog');
            var $modalBody = $modal.find('.modal-body');
            this.maximize($el);
            
            resetDimensions();
            showModal();
            setListener();
            
            function resetDimensions(){
                var height = $el.height();
                var width = $el.width();
                var padding = $modalBody.css('padding').replace('px', '');
                padding = parseInt(padding);
                $modalDialog.width(width + 2*padding);
                $modalDialog.height(height + 2*padding);
            };
            
            function showModal(){
                $modalBody.html($el);
                $modal.modal('show');
            };
            
            function setListener(){
                $modal.on('hidden.bs.modal', function(){
                    $('.modal-backdrop').remove();
                    $modal.off('hidden.bs.modal');
                });
            };
        },
        
        /**
         * Gets a random non shot cell.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @returns {object} A random cell.
         */
        getRandomCell: function(){
            var availableCells = this.$('.js-board-cell:not(.fired):not(.hit)');
            var randomCell;
            var randomCellPosition = Math.random()*availableCells.length;
            randomCellPosition = Math.floor(randomCellPosition);
            randomCell = $(availableCells.get(randomCellPosition));
            return randomCell;
        },
        
        /**
         * Shoots the clicked cell.
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} e - Click event
         */
        fire: function(e){
            var cell = $(e.target);
            var impact = this.fireAtCell(cell, 'Player');
            if(!impact){
                cell.addClass('fired');
                this.dispatcher.autoFire();
            }
        },
        
        /**
         * Shoots the desired cell in name of the desired player
         * @memberOf Battleship.Board.BattleshipBoardView
         * @param {object} cell - Cell to be shot.
         * @param {string} player - The player who performs the shot.
         * @returns {boolean} If impacted.
         */
        fireAtCell: function(cell, player){
            this.nShoots++;
            var position = this.getIndexSelected(cell);
            var alreadyFired = this.model.isCellFired(position.rowIndex, position.startIndex);
            var ship;
            var impact = true;
            var board = this;
            
            if(!alreadyFired){
                fire();
                if(impact){
                    removeFromStringIndex();
                    addToHitPositions();
                    addScore();
                }else{
                    removeFromEmptyIndex();
                    substractScore();
                }
            }
            
            return impact;
            
            function fire(){
                getShip();
                hit();
                log();
                store();
            };
            
            function getShip(){
                ship = board.model.isCellOccupied(position.rowIndex, position.startIndex);
            };
            
            function log(){
                board.dispatcher.coordinator.log(player, position, impact);
            };
            
            function hit(){
                if(ship){
                    cell.addClass('hit');
                    board.model.addHitToShip(ship, position);
                    impact = true;
                }else{
                    impact = false;
                }
            };
            
            function store(){
                board.model.addToFiredCells(position.rowIndex, position.startIndex);
            };
            
            function removeFromStringIndex(){
                board.model.removeFromStringIndex(position.rowIndex, position.startIndex, 'shipPositionStringIndex');
            };
            
            function removeFromEmptyIndex(){
                board.model.removeFromStringIndex(position.rowIndex, position.startIndex, 'emptyPositionIndex');
            };
            
            function addToHitPositions(){
                board.model.addToHitCells(position.rowIndex, position.startIndex);
            };
            
            function addScore(){
                board.dispatcher.addScore(50);
            };
            
            function substractScore(){
                board.dispatcher.substractScore(10);
            };
        },
        
        /**
         * Sets the event for showing the board modal.
         * @memberOf Battleship.Board.BattleshipBoardView
         */
        setViewEvents: function(){
            this.undelegateEvents();
            this.events = {
                'click': 'showModalBoard',
            }
            this.delegateEvents();
        },
        
        /**
         * Sets the event for firing in the board view.
         * @memberOf Battleship.Board.BattleshipBoardView
         */
        setFireEvents: function(){
            this.undelegateEvents();
            this.events = {
                'click div>div': 'fire'
            }
            this.delegateEvents();
        }
    
    });

}).apply(Battleship.Board);