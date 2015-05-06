/** @namespace */
var Battleship = {};

(function(){
    
    /**
     * Creates the battleship application.
     * @memberOf Battleship
     */
    this.createApp = function(){
        return new AppView();
    };
    
    
    /**
     * Represents the application view.
     * @namespace AppView
     * @memberOf Battleship
     */
    var AppView = Backbone.View.extend({
        el: 'html',
        
        events: {
            'click li>a':'setDifficulty',
            'click .js-start-game': 'startGame',
            'click .js-back': 'render',
        },
        
        template: function(tplId, args){
            var tpl = _.template($(tplId).html());
            return tpl(args);
        },
        
        initialize: function(){
            this.render();
            this.setAdditionalListeners();
        },
        
        render: function(){
            var mainHtml = this.template('#main-tpl');
            this.$('.js-main-container').html(mainHtml);
        },
        /**
         * Set the application listeners to resize the board.
         * @memberOf Battleship.AppView
         */
        setAdditionalListeners: function(){
            var app = this;
            var minimumSize = {
                outerHeight: 480,
                outerWidth: 720
            }
            $(window).on('resize', function(e){
                var game = app.game;
                if(game){
                    var enemyBoard = game.getEnemyBoard().view;
                    var playerBoard = game.getBoard().view;

                    enemyBoard.getSizes();
                    playerBoard.getSizes();

                    if(app.game.status === 'placing'){
                        playerBoard.maximize();
                    }else if(app.game.status === 'firing'){
                        enemyBoard.maximize();
                        playerBoard.minimize();
                    }
                }
            });
            
            $(window).on('resize', function(e){
                var currentSize = {
                    outerHeight: window.outerHeight,
                    outerWidth: window.outerWidth
                }
                var newSizes = {};
                
                getMinimum('outerHeight');
                getMinimum('outerWidth');
                setWindowSize();
                
                function getMinimum(dimension){
                    if(currentSize[dimension]<minimumSize[dimension]){
                        newSizes[dimension] = minimumSize[dimension];
                    }
                };
                
                function setWindowSize(){
                    if(!_.isEmpty(newSizes)){
                        var newHeight = newSizes.outerHeight || currentSize.outerHeight;
                        var newWidth = newSizes.outerWidth || currentSize.outerWidth;
                        window.resizeTo(newWidth, newHeight);
                    }
                };
            })
        },
        
        /**
         * Set the application difficulty.
         * @memberOf Battleship.AppView
         */
        setDifficulty: function(e){
            console.log($(e.target));
            this.difficulty = $(e.target).data('difficulty') || 'easy';
            this.showNextStep();
        },
        
        /**
         * Display the confirm screen.
         * @memberOf Battleship.AppView
         */
        showNextStep: function(){
            var mainHtml = this.template('#main-second-tpl', {difficulty: this.difficulty.toUpperCase()});
            this.$('.js-second-container').html(mainHtml);
        },
        
        startGame: function(){
            this.renderGame();
            this.game = Battleship.Game.createGame(this.difficulty);
            this.game.app = this;
            this.game.status = 'placing';
        },
        
        renderGame: function(){
            var gameHtml = this.template('#game_tpl');
            this.$('.js-second-container').html(gameHtml);
        },
        
        renderFinalModal: function(finalMessage){
            var player = this.game.getBoard().view;
            var enemy = this.game.getEnemyBoard().view;
            var battleEnd = Date.now();
            var totalTime = battleEnd - this.game.battleStart;
            var html = this.template('#modal-final-tpl', {message: finalMessage, player: player, enemy: enemy, total: totalTime, game: this.game});
            var $modal = $('#modal');
            $modal.find('.modal-content').addClass('interface-container final-score');
            var $modalBody = $modal.find('.modal-body');
            $modalBody.html(html);
            $modal.on('hidden.bs.modal', function(){
                $('.modal-backdrop').remove();
                $modal.off('hidden.bs.modal');
            });
            $modal.modal({
              backdrop: 'static',
              keyboard: false
            });
            
        }
    })

}).apply(Battleship);