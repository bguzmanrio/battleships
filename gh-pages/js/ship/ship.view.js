/**
 * Represents the view of the application ship.
 * @namespace Battleship.Ship.Views
 * @memberOf Battleship.Ship
 */

Battleship.Ship.Views = {};

(function(){

    /**
     * Creates the display of the battleship ships.
     * @memberOf Battleship.Ship.Views
     */
    this.createShipDisplay = function(options){
        return new ShipDisplayView(options);
    };
    
    /**
     * Creates the viewer of the battleship ships.
     * @memberOf Battleship.Ship.Views
     */
    this.createShipViewer = function(options){
        return new ShipViewerView(options);
    };
    
    /**
     * Constructor for the ship display view.
     * @constructor
     * @memberOf Battleship.Ship.Views
     */
    var ShipDisplayView = Backbone.View.extend({
        
        events:{
            'click .js-place-auto': 'placeAuto'
        },
    
        initialize: function(options){
            this.viewer = options.shipViewer;
            this.placedShipsCollection = new Backbone.Collection();
            this.render();
        },
        
        template: function(){
            var tpl = _.template($('#ship_display_button').html());
            return tpl();
        },
        
        /**
         * Render a ShipView for each ship type in the collection.
         * @memberOf Battleship.Ship.Views.ShipDisplayView
         */
        render: function(){
            var shipsView = this.shipsView = [];
            var view = this;
            var auxView;
            var auxModel;
            this.$el.empty();
            var ships = this.collection.countBy('type');
            if(!_.isEmpty(ships)){
                this.$el.append(this.template());
            }
            
            _.each(ships, function(count, type){
                auxModel = {
                    type: type,
                    count: count
                };
                auxView = new ShipView({model: auxModel});
                auxView.parentView = view;
                view.$el.append(auxView.$el);
                shipsView.push(auxView);
            })
        },
        
        selectShip: function(type){
            var modelsAvailable = this.collection.where({type: type}) || [];
            var modelToDisplay = modelsAvailable[0];
            if(modelToDisplay){
                this.dispatcher.selectShip(modelToDisplay);
            }
        },
        
        shipPlaced: function(ship){
            this.placedShipsCollection.add(ship);
            this.collection.remove(ship);
            this.render();
        },
        
        getPlacedShip: function(shipId){
            return this.placedShipsCollection.get(shipId);
        },
        
        deleteShip: function(ship){
            this.collection.add(ship);
            this.placedShipsCollection.remove(ship);
            this.render();
        },
        
        placeAuto: function(){
            this.dispatcher.placeShipAuto();
        }
    });
        
    /**
     * Constructor for each ship type view
     * @constructor
     * @memberOf Battleship.Ship.Views
     */
    var ShipView = Backbone.View.extend({
        events: {
            'click .js-add-ship': 'selectShip'
        },
        
        template: function(){
            var tpl = _.template($('#ship_display').html());
            return tpl({type: this.model.type, count: this.model.count});
        },
        
        initialize: function(){
            this.render();
        },
        
        render: function(){
            this.$el.html(this.template());
        },
        
        selectShip: function(e){
            e.preventDefault();
            if(this.model.count > 0){
                this.parentView.selectShip(this.model.type);
            }
        }
        
    });
    
    /**
     * Constructor for then ship viewer view.
     * @constructor
     * @memberOf Battleship.Ship.Views
     */
    var ShipViewerView = Backbone.View.extend({
        
        directions: {
            'horizontal': 'vertical',
            'vertical': 'horizontal'
        },
        
        events: {
            'click .js-place-ship': 'placeShip',
            'click .js-rotate-ship': 'rotateShip',
            'click .js-rotate-edition-ship': 'rotateEditedShip',
            'click .js-remove-ship': 'deleteShip'
        },
        
        template: function(){
            var tpl = _.template($('#ship_viewer').html());
            return tpl({type: this.getType(), direction: this.getDirection(), mode: this.getMode(), length: this.getLength()});
        },
        
        initialize: function(){
            this.render();
        },
        
        render: function(){
            this.$el.html(this.template());
        },
        
        getType: function(){
            if(this.model){
                return this.model.get('type');
            }else{
                return 'Select a ship to place';
            }
        },
        
        getLength: function(){
            if(this.model){
                return this.model.get('length');
            }else{
                return '';
            }
        },
        
        getDirection: function(){
            if(this.model){
                return this.model.get('direction') || 'vertical';
            }else{
                return ''
            }
        },
        
        getMode: function(){
            return this.mode || false;
        },
        
        selectShip: function(model){
            this.model = model;
            this.mode = "add";
            this.render();
        },
        
        placeShip: function(e){
            e.preventDefault();
            if(this.model){
                this.dispatcher.prepareShip(this.model);
            }
        },
        
        /**
         * Rotates the previewed ship.
         * @memberOf Battleship.Ship.Views.ShipViewerView
         */
        rotateShip: function(e){
            e.preventDefault();
            var currentDirection;
            if(this.model){
                currentDirection = this.model.get('direction');
                this.model.set('direction', this.directions[currentDirection]);
                this.render();
            }
        },
        
        rotateEditedShip: function(e){
            e.preventDefault();
            this.dispatcher.rotatePlacedShip(this.model);
        },
        
        changeShipDirection: function(){
            if(this.model){
                var currentDirection = this.model.get('direction');
                this.model.set('direction', this.directions[currentDirection]);
            }
        },
        
        resetState: function(){
            this.model = "";
            this.mode = "";
            this.render();
        },
        
        deleteShip: function(e){
            this.dispatcher.deleteShip(this.model);
        },
        
        selectToEdit: function(ship){
            this.model = ship;
            this.mode = "edition";
            this.render();
        }
    })

}).apply(Battleship.Ship.Views);