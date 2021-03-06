/**
 * Represents the application view.
 * @namespace Battleship.Game
 * @memberOf Battleship
 */
Battleship.Game = {};

(function(){
    
    /**
     * Creates a battleship player.
     * @memberOf Battleship.Game
     */
    this.createPlayerDispatcher = function(battleshipEntities){
        return new PlayerDispatcher(battleshipEntities);
    };
    
    /**
     * Creates the battleship coordinator.
     * @memberOf Battleship.Game
     */
    this.createGame = function(diff){
        return new GameCoordinator(diff);
    }
    
    /**
     * Constructor for each player instance.
     * @constructor 
     * @memberOf Battleship.Game
     * @param {object} battleshipEntities - The entities the player will be using
     */
    var PlayerDispatcher = (function(battleshipEntities){
        var entities = {};
        var score = 0;
        var dispatcher = this;
        
        this.selectShip = function(params){
            entities.viewer.selectShip(params);
        };
        
        this.placeShipAuto = function(){
            entities.board.placeShipAuto();
        }
        
        this.prepareShip = function(ship){
            entities.board.prepareShip(ship);
        };
        
        /**
         * Cleans the interface container and add ship to placed ships collection.
         * @memberOf Battleship.Game.PlayerDispatcher
         * @param {object} ship - Ship to be placed.
         */
        this.placedShip = function(ship){
            if(entities.viewer){
                entities.viewer.resetState();
            }
            if(entities.display){
                entities.display.shipPlaced(ship);
            }else{
                entities.collection.remove(ship);
            }
            dispatcher.placedShipsCollection.add(ship);
        };
        
        /**
         * Selects a placed ship
         * @memberOf Battleship.Game.PlayerDispatcher
         * @param {string} shipId - Ship id.
         */
        this.selectPlacedShip = function(shipId){
            var selectedShip = entities.display.getPlacedShip(shipId);
            if(selectedShip){
                entities.viewer.selectToEdit(selectedShip);
            }
        };
        
        /**
         * Cleans the interface container and add ship to placed ships collection.
         * @memberOf Battleship.Game.PlayerDispatcher
         * @param {object} ship - Ship to be deleted.
         */
        this.deleteShip = function(ship){
            entities.board.deleteShip(ship);
            entities.display.deleteShip(ship);
            entities.viewer.resetState();
        };
        
        /**
         * Checks and rotate a placed ship.
         * @memberOf Battleship.Game.PlayerDispatcher
         * @param {object} ship - Ship to be rotated.
         */
        this.rotatePlacedShip = function(ship){
            
            var shipPosition = entities.board.getPlacedShipPosition(ship.cid);
            entities.viewer.changeShipDirection();
            var shipFits = entities.board.model.getShipFits(shipPosition, ship);
            
            if(shipFits){
                entities.viewer.render();
                entities.board.deleteShip(ship);
                entities.board.prepareShip(ship);
                entities.board.placeShip(shipPosition);
            }else{
                entities.viewer.changeShipDirection();
            }
        };
        
        this.setPlayerReady = function(){
            dispatcher.dispatcherView.renderStartBattle();
        };
        
        this.unSetPlayerReady = function(){
            dispatcher.dispatcherView.hideStartBattle();
        };
        
        this.minimize = function(){
            this.dispatcherView.$el.parent().addClass('g_3_bs');
            entities.board.minimize();
            entities.viewer.remove();
            entities.display.remove();
        };
        
        this.maximize = function(){
            this.dispatcherView.$el.parent().show();
            this.dispatcherView.$el.parent().removeClass('hidden');
            this.dispatcherView.$el.parent().addClass('g_7_bs');
            entities.board.maximize();
        };
        
        this.clearInterface = function(){
            this.dispatcherView.$('.interface-container').empty();
        };
        
        this.getCollection = function(){
            return entities.collection;
        };
        
        this.getPlacedCollection = function(){
            return dispatcher.placedShipsCollection;
        };
        
        this.getDestroyedCollection = function(){
            return dispatcher.destroyedShipCollection;
        };
        
        this.addDestroyedShip = function(ship){
            dispatcher.destroyedShipCollection.add(ship);
            dispatcher.placedShipsCollection.remove(ship);
        };
        
        this.getPlayerBoard = function(){
            return dispatcher.coordinator.getBoard();
        };
        
        this.autoFire = function(){
            var enemyModel = dispatcher.coordinator.getEnemyBoard().model;
            enemyModel.autoFire();
        };
        
        this.addScore = function(scoreToAdd){
            score += scoreToAdd;
            dispatcher.coordinator.updateScore();
        };
        
        this.substractScore = function(scoreToSubstract){
            score -= scoreToSubstract;
            dispatcher.coordinator.updateScore();
        };
        
        this.getScore = function(){
            return score;
        }
        
        setEntities();
        createView();
        createPlacedCollection();
        createDestroyedCollection();
        startListening();
        if(entities.board.auto){
            entities.board.placeShipAuto();
        }
        
        function setEntities (){
            $.each(battleshipEntities, function(pos, entity){
                entities[pos] = entity;
                entity.dispatcher = dispatcher;
            })
        };
        
        function createView(){
            dispatcher.dispatcherView = new PlayerDispatcherView({entities: entities, dispatcher: dispatcher});
        };
        
        function createPlacedCollection(){
            dispatcher.placedShipsCollection = new Backbone.Collection();
        };
        
        function createDestroyedCollection(){
            dispatcher.destroyedShipCollection = new Backbone.Collection();
        };
        
        function startListening(){
            Backbone.listenTo(dispatcher.placedShipsCollection, 'remove', function(){                
                if(!dispatcher.placedShipsCollection.length){
                    dispatcher.noBoatsLeft();
                }
            })
        }
    });
    
    /**
     * Constructor for each player instance view.
     * @constructor 
     * @memberOf Battleship.Game
     */
    var PlayerDispatcherView = Backbone.View.extend({
        
        events: {
            'click .js-start-battle': 'endPlayerPlacing'
        },
        
        template: function(tpl, args){
            var tpl = _.template($(tpl).html());
            return tpl(args);
        },
        
        initialize: function(options){
            this.entities = options.entities;
            this.dispatcher = options.dispatcher;
            this.render();
            this.setListeners();
        },
        
        /**
         * Sets listeners to diplay the "Start Battle" button.
         * @memberOf Battleship.Game.PlayerDispatcherView
         */
        setListeners: function(){
            this.listenTo(this.entities.collection, 'remove', function(model, collection){
                if(collection.length === 0){
                    collection.dispatcher.setPlayerReady();
                }
            });
            this.listenTo(this.entities.collection, 'add', function(model, collection){
                if(collection.length > 0){
                    collection.dispatcher.unSetPlayerReady();
                }
            });
        },
        
        render: function(){
            var html = this.template('#player-tpl');
            this.$el.html(html);
            if(this.entities.board){
                this.$(".js-board-container").html(this.entities.board.$el)
            }
            if(this.entities.display){
                this.$(".js-ships-container").html(this.entities.display.$el)
            }
            if(this.entities.viewer){
                this.$(".js-ship-viewer").html(this.entities.viewer.$el)
            }else{
                this.$('.interface-container').remove();
            }
        },
        
        renderStartBattle: function(){
            if(this.entities.board.renderShips){
                var html = this.template('#start-game-tpl');
                this.$('.js-ships-container').append(html);
            }
        },
        
        renderEnemyBoard: function(enemyBoard){
            this.$('.js-enemy-board-container').html(enemyBoard.$el);
        },
        
        hideStartBattle: function(){
            this.$('.js-start-container').remove()
        },
        
        endPlayerPlacing: function(){
            this.$('.js-start-battle').empty();
            this.$('.interface-container').remove();
            this.dispatcher.coordinator.endPlacing();
        },
        
    });
    
    /**
     * Constructor for the battleship game.
     * @constructor 
     * @memberOf Battleship.Game
     */
    var GameCoordinator = (function(difficulty){
        var player;
        var enemy;
        var ships = [];
        var ships2 = [];
        var coordinator = this;
        var playerCollection;
        var enemyCollection; 
        var boardModel;
        var enemyBoardModel;
        var shipViewer;
        var shipsDisplay;
        var boardView;
        var enemyBoardView;
    
        createShips();
        createCollections();
        createModels();
        createViews();
        createPlayers();
        $('#player').html(player.dispatcherView.$el);
        $('#enemy').html(enemy.dispatcherView.$el);
        
        function createShips(){
            ships.push(Battleship.Ship.createShip('battleship'));
            ships.push(Battleship.Ship.createShip('destroyer'));
            ships.push(Battleship.Ship.createShip('destroyer'));
            ships2.push(Battleship.Ship.createShip('battleship'));
            ships2.push(Battleship.Ship.createShip('destroyer'));
            ships2.push(Battleship.Ship.createShip('destroyer'));
        };
        
        function createCollections(){
            playerCollection = Battleship.Ship.Collection.createShipCollection(ships);
            enemyCollection = Battleship.Ship.Collection.createShipCollection(ships2);
        };
        
        function createModels(){
            boardModel = Battleship.Board.Model.createBoardModel({
                occupiedPositions: {},
                shipPositionIndex: {},
                firedPositions: {},
                hitPositions: {}
            });
            enemyBoardModel = Battleship.Board.Model.createBoardModel({
                occupiedPositions: {},
                shipPositionIndex: {},
                firedPositions: {},
                hitPositions: {},
                difficulty: difficulty
            });
        };
        
        function createViews(){
            shipViewer = Battleship.Ship.Views.createShipViewer();
            shipsDisplay = Battleship.Ship.Views.createShipDisplay({collection: playerCollection, shipViewer: shipViewer});
            boardView = Battleship.Board.createBoard({model: boardModel, render: true});
            enemyBoardView = Battleship.Board.createBoard({model: enemyBoardModel, auto:true});

        };
        
        function createPlayers(){
            player = Battleship.Game.createPlayerDispatcher({viewer: shipViewer, display: shipsDisplay, board: boardView, collection: playerCollection, boardModel: boardModel});
            enemy = Battleship.Game.createPlayerDispatcher({board: enemyBoardView, collection: enemyCollection, boardModel: enemyBoardModel});
            player.coordinator = coordinator;
            enemy.coordinator = coordinator;
            
            player.noBoatsLeft = function(){
                enemyBoardView.undelegateEvents();
                coordinator.app.renderFinalModal('You lose!');
            }
            
            enemy.noBoatsLeft = function(){
                enemyBoardView.undelegateEvents();
                coordinator.app.renderFinalModal('Player wins!');
            }
        };
        
        /**
         * Displays the enemy board and minimizes the player's one.
         * @memberOf Battleship.Game.GameCoordinator
         */
        this.endPlacing = function(){
            player.minimize();
            boardModel.createPositionIndex();
            boardView.setViewEvents();
            enemy.maximize();
            enemy.clearInterface();
            enemyBoardView.setFireEvents();
            $('.log-container').show();
            this.status = 'firing';
            this.battleStart = Date.now();
        };
        
        this.getBoard = function(){
            return {view: boardView, model: boardModel};
        }
        
        this.getEnemyBoard = function(){
            return {view: enemyBoardView, model: enemyBoardModel};
        };
        
        /**
         * Logs the result of the last movement made.
         * @memberOf Battleship.Game.GameCoordinator
         * @param {string} player - Player who has performed the shot
         * @param {object} cell - Position shot
         * @param {boolean} isImpact - if the cell has been shot.
         */
        this.log = function(player, cell, isImpact){
            var row = cell.rowIndex;
            var column = cell.startIndex;
            var impact = 'Missed!';
            var message;
            
            createMessage();
            displayLog();
            
            function createMessage(){
                if(isImpact){
                    impact = 'Hit!';
                }
                message ='<strong>' + player + '</strong> shoots to [' + row + ',' + column + ']....... ' + impact;
            }
            
            function displayLog(){
                var date = new Date();
                $('.log-container').append('<p class="log">' + date.toLocaleString() + ': ' + message + '</p>')
            }
        };
        
        this.updateScore = function(){
            var enemyScore = player.getScore()
            var playerScore = enemy.getScore();
            console.log('player: ', playerScore);
            console.log('enemy: ', enemyScore);
        };
        
        this.getPlayerScore = function(){
            return player.getScore();
        };
        
        this.getEnemyScore = function(){
            return enemy.getScore();
        };  
    });

}).apply(Battleship.Game);