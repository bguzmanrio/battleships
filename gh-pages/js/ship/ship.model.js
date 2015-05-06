/**
 * Represents the application ship.
 * @namespace Battleship.Ship
 * @memberOf Battleship
 */
Battleship.Ship = {};

(function(){
    "use strict";
    var that = this;
    
    /**
     * Creates the battleship ship.
     * @memberOf Battleship.Ship
     */
    this.createShip = function(options){
        var options = optionsByType[options];
        options.damages = [];
        var model = new ShipModel(options);
        return model;
    };
    
    var optionsByType = {
        battleship: {
            type: 'battleship',
            length: 5
        },
        
        destroyer: {
            type: 'destroyer',
            length: 4
        }
    }
    
    /**
     * Constructor for the ship model.
     * @constructor
     * @memberOf Battleship.Ship
     */
    var ShipModel = Backbone.Model.extend({
        defaults:{
            type: '',
            direction: 'vertical'
        },
        
        classes: {
            'battleship': 'ship battleship',
            'destroyer': 'ship destroyer'
        },
        
        percentages: {
            'battleship': ['ship0p','ship25p','ship50p','ship75p','ship100p'],
            'destroyer': ['ship0p','ship33p','ship66p','ship100p']
        },
        
        /**
         * Get the class for the visual representation of the ship in the board.
         * @memberOf Battleship.Ship.ShipModel
         * @param {object} position - position of the ship.
         * @returns {string} The class to apply to the cell.
         */
        getClass: function(position){
            var ship = this;
            var shipType = this.get('type');
            var direction = this.get('direction');
            var baseClass = this.classes[shipType];
            if(typeof position !== 'undefined'){
                getPercentage()
                getDirection();
            }else{
                getAllPercentages();
                getAllDirections();
            }
            
            return baseClass;
            
            function getPercentage(){
                baseClass += ' ' + ship.percentages[shipType][position];
            };
            
            function getAllPercentages(){
                baseClass += ' ' + ship.percentages[shipType].join(' ');
            };
            
            function getDirection(){
                baseClass += ' ' + direction
            };
            
            function getAllDirections(){
                baseClass += ' vertical horizontal';
            };
        },
        
        addDamage: function(position){
            this.attributes.damages.push(position);
        },
        
        isDestroyed: function(){
            return this.get('length') === this.get('damages').length;
        }
    });
        
    
    
}).apply(Battleship.Ship);