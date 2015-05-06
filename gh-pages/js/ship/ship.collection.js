/**
 * Represents the collection of the application ship.
 * @namespace Battleship.Ship.Collection
 * @memberOf Battleship.Ship
 */
Battleship.Ship.Collection = {};

(function(){
    
    /**
     * Creates the collection of battleship ships.
     * @memberOf Battleship
     */
    this.createShipCollection = function(ships){
        return new ShipCollection(ships);
    }
    
    var ShipCollection = Backbone.Collection.extend({
    });
    
}).apply(Battleship.Ship.Collection)