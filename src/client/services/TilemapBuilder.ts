import { SignalManager } from "./SignalManager";
import { Controls } from "./Controls";
import { tiledata } from "../user-interface/BuildMenu";
import { Player } from "../actors/Player";
import { Tweens } from "phaser";
import { BuildingTags } from "./BuildingTags";

/**
 * This class is used on conjunction with the Build Menu class to
 * encompass the games building mechanics. The Build Menu allows
 * the picking of the tools and tiles placed by this class. They
 * are seperate both because one is a ui class while one is a functional
 * class and because one stays on the hud and the other directly edits
 * many diffrent scenes. Since this one edits many scenes it can't hold tilemaps and
 * graghics it's self and is only funcitons for editing existing tilemaps.
 */
export class TilemapBuilder {

    //member varibles

    //scene
    /**
     * A refernce to the current phaser scene we are building in,
     * This is however seperate from the scene that the buttons
     * and html tile section menu is set up in. This changes as
     * we change scenes.
     */
    currentScene: Phaser.Scene;

    //numbers
    /**Tells us how to rotate a tile before placing it, also controls rotation
     * on the tileCursor */
    rotation: number;
    /**Used to store the depth of layers meant to apear above the player */
    upperDepth: number;
    /**Used to store the depth of layers meant to apear below the player */
    lowerDepth: number;
    /**Used to store the depth of the cursors */
    cursorDepth: number;
    /**Current radius of visible tiles underneath roofs */
    roofLayerVision: number = 0;
    /**Current radius of visible tiles around each non-leader party member */
    partyRoofLayerVision: number = 0;

    //dynamic layers
    /**holds all the dynamic layers we build on */
    buildingLayers: { [key: string]: Phaser.Tilemaps.DynamicTilemapLayer };

    // Handles signals from other scenes/classes
    signals: SignalManager;

    //sprites
    /**Used to show players where they are about to build */
    cursorTile: Phaser.GameObjects.Sprite;
    /**Used as a build mode icon of the hammer, does a hammering motion when placing a tile */
    toolCursor: Phaser.GameObjects.Sprite;

    //controls
    controls: Controls;

    //tweens
    /**Those tween is played when clicking in build mode and make the hammer cursor
     * looking like it is hammering the block in place */
    hammeringTween: Phaser.Tweens.Tween;
    /**This give the effect of the block selected with the building mode fading back and
     * forth */
    cursorTween: Phaser.Tweens.Tween;

    //tiledata
    /**This stores the currently selected tile based on information sent from the BuildMenu class */
    currentTile: tiledata;

    //tilesets
    /**Holds all the tilesets for the diffrent layers */
    tileSets: {[key: string]: Phaser.Tilemaps.Tileset};
    

    //booleans
    /**Used to tell weather this scene is currently in build mode or not */
    inBuildMode: boolean;

    //string
    /**keeps track of what tool is selected in the build menu */
    toolSelected: string;
    /**keeps track of what layer is selected in the build menu */
    layerSelected: string;

    //Handlers
    /**stores all the handlers for our events so we can turn them off later */
    handlers: { [key: string]: Function }

    //player
    /**A reference to the current scenes player */
    player: Player;

    //tags
    /**Stores all the tags used for special building items */
    tags: BuildingTags;

    /**creates our instance of this class, a new instance is created for
     * every scene, as such we don't need to worry about persisting things
     * across scenes.
     * @param scene The scene we will be building in
     * @param map A refernce to the tilemap we'll be building on
     */
    constructor(scene: Phaser.Scene, map: Phaser.Tilemaps.Tilemap) {
        //inital values
        this.currentScene = scene;
        this.rotation = 0;
        this.inBuildMode = false;
        this.toolSelected = "";
        this.layerSelected = "";
        this.signals = SignalManager.get();
        this.controls = Controls.getInstance();
        this.tags = BuildingTags.get();
        this.upperDepth = 0;
        this.lowerDepth = 0;
        this.cursorDepth = 0;
        this.handlers = {};
        //create everything
        this.createLayers(map);
        this.createListeners();
        this.createToolCursor();
        //grab the inital values need from the menu
        this.signals.emit("newTilemapBuilder");
    }

    /**creates the cursor tool and sets all its default values */
    createToolCursor() {
        //create build mode hammer cursor
        this.toolCursor = this.currentScene.add.sprite(0, 0, "hammerIcon");
        this.toolCursor.setScale(1);
        this.toolCursor.setDepth(this.cursorDepth + 0.1);
        this.toolCursor.setVisible(false);
        this.hammeringTween = this.currentScene.tweens.add({
            targets: this.toolCursor,
            angle: 90,
            duration: 150,
            paused: true,
            repeat: 0,
            yoyo: true
        });
    }

    /**
     * Creates the 4 building layers floor,wall,roof,special and
     * the stores refernces to them.
     * @param map the map to create the layers in
     */
    createLayers(map: Phaser.Tilemaps.Tilemap) {
        this.tileSets = {};
        //eventually this will be imported in but for now it is hardcoded
        this.tileSets["floor"] = map.addTilesetImage("floorTiles");
        this.tileSets["wall"] = map.addTilesetImage("wallTiles");
        this.tileSets["roof"] = map.addTilesetImage("roofTiles");
        this.tileSets["special"] = map.addTilesetImage("specialTiles");

        this.buildingLayers = {};
        let builderTileSetArray = [this.tileSets["floor"], this.tileSets["wall"], this.tileSets["roof"], this.tileSets["special"]];
        //create new black dynamic layers
        this.buildingLayers["floor"] = map.createBlankDynamicLayer("floor", builderTileSetArray);
        this.buildingLayers["wall"] = map.createBlankDynamicLayer("wall", builderTileSetArray);
        this.buildingLayers["roof"] = map.createBlankDynamicLayer("roof", builderTileSetArray);
        this.buildingLayers["special"] = map.createBlankDynamicLayer("special", builderTileSetArray);
        //set depths
        this.buildingLayers["floor"].depth = this.lowerDepth + 0.1;
        this.buildingLayers["wall"].depth = this.lowerDepth + 0.2;
        this.buildingLayers["special"].depth = this.lowerDepth + 0.3;
        this.buildingLayers["roof"].depth = this.upperDepth;
    }

    /**Sets up varibles and logic for when entering build mode */
    enterBuildMode() {
        this.inBuildMode = true;
        if (this.cursorTile) {
            this.cursorTween.resume();
        }
    }

    /**Sets up varibles and logic for when exiting build mode */
    exitBuildMode() {
        this.inBuildMode = false;
        this.toolCursor.setVisible(false);
        if (this.cursorTile) {
            this.cursorTile.setVisible(false);
            this.cursorTween.pause();
        }
    }

    /**
     * Adds collison to the player for the bulding players
     * @param player The player to add collison to all the party members of 
     * */
    addCollisionToPlayer(player: Player) {
        player.addCollisionByLayer(this.buildingLayers["wall"]);
        player.addCollisionByLayer(this.buildingLayers["special"]);
    }

    /**
     * Sets the depth for layers meant be shown above the player
     * @param newDepth the depth to set the upper layers to
     *  */
    setUpperDepth(newDepth: number) {
        this.upperDepth = newDepth;
        // this.buildingLayers["roof"].depth = this.upperDepth;
    }

    /**
     * Sets the depth for layers meant be shown below the player
     * @param newDepth the depth to set the lower layers to
     *  */
    setLowerDepth(newDepth: number) {
        this.lowerDepth = newDepth;
        this.buildingLayers["floor"].depth = this.lowerDepth + 0.1;
        this.buildingLayers["wall"].depth = this.lowerDepth + 0.2;
        this.buildingLayers["special"].depth = this.lowerDepth + 0.3;
        this.buildingLayers["roof"].depth = this.lowerDepth + 0.4;
    }

    /**
     * sets the depth of the cursors
     * @param newDepth The new depth to set the cursors to */
    setCursorDepth(newDepth: number) {
        this.cursorDepth = newDepth;
        this.toolCursor.setDepth(this.cursorDepth + 0.1);
        if (this.cursorTile) {
            this.cursorTile.setDepth(this.cursorDepth + 0.2);
        }
    }


    /**
     * Update function called in the update loop to run the logic for moving and placing blocks when in build mode. 
     * @param player what player is doing the building here and we should check around to allow building
     * @param checkLayers a set of layers to check over before building
     * */
    update(player: Player, checkLayers: (Phaser.Tilemaps.StaticTilemapLayer | Phaser.Tilemaps.DynamicTilemapLayer)[] = []) {
        if (this.inBuildMode) {
            //grab the cursor's current point in the world taking into account the camera
            let worldPoint = <Phaser.Math.Vector2>this.currentScene.input.activePointer.positionToCamera(this.currentScene.cameras.main);
            let worldTile: Phaser.Math.Vector2 = this.buildingLayers["floor"].worldToTileXY(worldPoint.x, worldPoint.y, true);
            let tilecoord: Phaser.Math.Vector2 = this.buildingLayers["floor"].tileToWorldXY(worldTile.x, worldTile.y);
            //move cursor tile
            if (this.currentTile) {
                this.cursorTile.x = tilecoord.x + 8;
                this.cursorTile.y = tilecoord.y + 8;
            }
            //move cursor hammer
            this.toolCursor.x = worldPoint.x - 10;
            this.toolCursor.y = worldPoint.y - 10;
            //check there is nothing already on the check layers
            let nothingOnOtherLayers: boolean = true;
            for (let i = 0; i < checkLayers.length; i++) {
                if (checkLayers[i].getTileAtWorldXY(worldPoint.x, worldPoint.y)) {
                    nothingOnOtherLayers = false;
                }
            }

            if (nothingOnOtherLayers) {
                if (this.toolSelected == "hammer" && this.currentTile) {
                    this._checkBuildBlock(player, tilecoord);
                } else if (this.toolSelected == "pick") {
                    this._checkRemoveBlock(player, tilecoord);
                } else {
                    this.toolCursor.setVisible(false);
                }
            } else {
                if (this.cursorTile) {
                    this.cursorTile.setVisible(false);
                }
                this.toolCursor.setVisible(false);
            }
        }
        this.updateRoofVisible(player);
        //will need to reconfigure later but just for testing for now
        this.player = player;
    }

    /**An internal function for checking if to show the cursors and if to place a block at the cursors place
     * it is called in the update function only under certain perset conditions. 
     */
    _checkBuildBlock(player: Player, tilecoord: Phaser.Math.Vector2) {
        /*run a set of checks to see if the action attemping to be preformed is possible,
        all values start true and may be changed to false by a check */
        let withinRadius: boolean = true;
        let notBuildingOnPlayer: boolean = true;
        //check for radius around player
        let differenceX = Math.abs(player.party[0].sprite.x - tilecoord.x);
        let differenceY = Math.abs(player.party[0].sprite.y - tilecoord.y)
        if (Math.hypot(differenceX, differenceY) > 125) {
            withinRadius = false;
        }
        //check we are not building on the player
        let playerBounds: any = {};
        // player.party[0].sprite.getBounds();
        (<Phaser.Physics.Arcade.Body>player.party[0].sprite.body).getBounds(playerBounds);
        let tilebounds = new Phaser.Geom.Rectangle(tilecoord.x, tilecoord.y, 16, 16);
        if (Phaser.Geom.Rectangle.Overlaps(playerBounds, tilebounds)) {
            notBuildingOnPlayer = false;
        }
        //determine if to show the cursors
        if (withinRadius && ((this.layerSelected == "floor" || this.layerSelected == "roof") || notBuildingOnPlayer)) {
            this.cursorTile.setVisible(true);
            this.toolCursor.setVisible(true);
        } else {
            this.cursorTile.setVisible(false);
            this.toolCursor.setVisible(false);
        }

        if (withinRadius && this.currentScene.input.manager.activePointer.isDown) {
            if(this.layerSelected != '' && this.layerSelected != "special"){
                this.hammeringTween.play();
                let tilesetStart = this.tileSets[this.layerSelected].firstgid;
                let index = tilesetStart + this.currentTile.tileSetOffSet;
                let tile = this.buildingLayers[this.layerSelected].putTileAtWorldXY(index, tilecoord.x, tilecoord.y);
                tile.rotation = Phaser.Math.DegToRad(this.rotation);
                if ((this.layerSelected == "wall") && notBuildingOnPlayer) {
                    tile.setCollision(true,true,true,true);
                    tile.properties = this.tileSets[this.layerSelected].getTileProperties(index);
                }                
            } else if (this.layerSelected == "special"){
                this._buildSpecialBlock(tilecoord.x, tilecoord.y,this.currentTile.tileSetOffSet);
            }
        }
    }

    _buildSpecialBlock(x: number, y: number, offset: number){
        this.hammeringTween.play();
        let testTile = this.currentScene.physics.add.sprite(x,y,"specialTiles",offset);
        testTile.depth = 100;
        testTile.x = this.cursorTile.x + 8;
        testTile.y = this.cursorTile.y + 8;
        testTile.body.setSize(48,48);
        testTile.setDataEnabled();
        this.tags.applyTag("door",testTile,this.player,this.currentScene);
    }

    _checkRemoveBlock(player: Player, tilecoord: Phaser.Math.Vector2) {
        //check for radius around player
        let differenceX = Math.abs(player.party[0].sprite.x - tilecoord.x);
        let differenceY = Math.abs(player.party[0].sprite.y - tilecoord.y)
        //determine if to show the cursors
        if (this.cursorTile) {
            this.cursorTile.setVisible(false);
        }
        if (!(Math.hypot(differenceX, differenceY) > 125)) {
            this.toolCursor.setVisible(true);
        } else {
            this.toolCursor.setVisible(false);
        }
        if (!(Math.hypot(differenceX, differenceY) > 125) && this.currentScene.input.manager.activePointer.isDown) {
            this.hammeringTween.play();
            this.buildingLayers[this.layerSelected].removeTileAtWorldXY(tilecoord.x, tilecoord.y);
        }
    }

    /**
     * checks a radius around the player and sets the alpha of tiles around the player
     */
    updateRoofVisible(player: Player) {

        // Varibles
        const maxOuterRadius = 200;
        const maxPartyRadius = 60;
        let innerRadius = .5 * this.roofLayerVision;
        let tileCoords = this.buildingLayers["roof"].worldToTileXY(player.party[0].sprite.x, player.party[0].sprite.y);
        let underRoofTile = this.buildingLayers["roof"].hasTileAt(tileCoords.x, tileCoords.y);

        if (underRoofTile || this.inBuildMode) {
            // Slowly (each update) increase the visible radius to a maximum
            if (this.roofLayerVision < maxOuterRadius) this.roofLayerVision += 3;
            if (this.partyRoofLayerVision < maxPartyRadius) this.partyRoofLayerVision += 2;
        }
        else {
            if (this.roofLayerVision > 0) this.roofLayerVision -=2;
            if (this.partyRoofLayerVision > 40) this.partyRoofLayerVision -= 1; 
        }

        // Get the circle of tiles around the player
        let outerCircleOfTiles = this.buildingLayers["roof"].getTilesWithinShape(
            new Phaser.Geom.Circle(player.party[0].sprite.x, player.party[0].sprite.y, this.roofLayerVision),
            { isNotEmpty: true }
        );
        //get the circle of tiles around each of the non-leader party characters
        let partyCircleArray = [];
        for(let i = 1; i < player.party.length; i++){
            let newCircle = this.buildingLayers["roof"].getTilesWithinShape(
                new Phaser.Geom.Circle(player.party[i].sprite.x, player.party[i].sprite.y, this.partyRoofLayerVision),
                { isNotEmpty: true }
            );
            partyCircleArray.push(newCircle);
        }

        // In build mode nearby roof tiles should all be see through but
        // visible
        if (this.inBuildMode) {
            if (this.layerSelected == "roof") {
                //set alpha for leader
                outerCircleOfTiles.forEach(
                    (tile) => {
                        tile.setAlpha(0.5);
                    }
                )
                //set alpha for other party members
                partyCircleArray.forEach(
                    (circle: Phaser.Tilemaps.Tile[]) => {
                        circle.forEach(
                            (tile) => {
                                tile.setAlpha(0.5);
                            }
                        )
                    }
                )
            } else {
                //set alpha for leader
                outerCircleOfTiles.forEach(
                    (tile) => {
                        tile.setAlpha(0.1);
                    }
                )
                //set alpha for other party members
                partyCircleArray.forEach(
                    (circle: Phaser.Tilemaps.Tile[]) => {
                        circle.forEach(
                            (tile) => {
                                tile.setAlpha(0.5);
                            }
                        )
                    }
                )
            }
        }
        // Outside of build mode, roof tiles are invisible very near to the
        // player and are less faded as distance increases
        else {
            /*here we do the non-leader party member's tiles so the leader;s below can
            override the if need be */
            for(let i = 1; i < player.party.length; i++){
                // The inner circle represents the tiles which should completely disappear
                // in the immediate radius of the player
                let partyInnerCircleOfTiles = this.buildingLayers["roof"].getTilesWithinShape(
                    new Phaser.Geom.Circle(player.party[i].sprite.x, player.party[i].sprite.y, (this.partyRoofLayerVision * .25)),
                    { isNotEmpty: true }
                );
    
                // Set every tile in the circle to be see through
                partyCircleArray[i-1].forEach(
                    (tile: Phaser.Tilemaps.Tile) => {
                        let tx = tile.getCenterX();
                        let ty = tile.getCenterY();
                        let dist = Math.hypot(tx - player.party[i].sprite.x, ty - player.party[i].sprite.y);
                        let newAlpha = (dist - (this.partyRoofLayerVision * .5)) / (this.partyRoofLayerVision - (this.partyRoofLayerVision * .5));
                        //only set the alpha if it is lower then the tiles current alpha
                        if(newAlpha < tile.alpha){
                            tile.setAlpha(newAlpha);
                        }
                    }
                )
                partyInnerCircleOfTiles.forEach(
                    (tile) => {
                        tile.setAlpha(0);
                    }
                )
            }

            // The inner circle represents the tiles which should completely disappear
            // in the immediate radius of the player
            let innerCircleOfTiles = this.buildingLayers["roof"].getTilesWithinShape(
                new Phaser.Geom.Circle(player.party[0].sprite.x, player.party[0].sprite.y, innerRadius),
                { isNotEmpty: true }
            );

            // Set every tile in the circle to be see through
            outerCircleOfTiles.forEach(
                (tile) => {
                    let tx = tile.getCenterX();
                    let ty = tile.getCenterY();
                    let dist = Math.hypot(tx - player.party[0].sprite.x, ty - player.party[0].sprite.y);
                    let newAlpha = (dist - innerRadius) / (this.roofLayerVision - innerRadius);
                    //only set the alpha if it is lower then the tiles current alpha
                    if(newAlpha < tile.alpha){
                        tile.setAlpha(newAlpha);
                    }
                }
            )
            innerCircleOfTiles.forEach(
                (tile) => {
                    tile.setAlpha(0);
                }
            )
        }

        // Get an array of all tiles which are not ALREADY
        // set to fade out on some timer
        let untimedTiles = outerCircleOfTiles.filter(
            (tile) => {
                return !tile["fadeTimer"];
            }
        )
        partyCircleArray.forEach(
            (circle: Phaser.Tilemaps.Tile[]) => {
                let partyUntimedTiles = circle.filter(
                    (tile) => {
                        return !tile["fadeTimer"];
                    }
                )
                untimedTiles = untimedTiles.concat(partyUntimedTiles);
            }
        )

        // If there are tiles which should be fading out, but
        // don't yet have a timer, create a new timer
        if (untimedTiles.length > 0) {
            // The timer will reset the alpha of all tiles passed to it
            let timer = setTimeout(
                (tiles) => {
                    tiles.forEach(
                        (tile) => {
                            tile.setAlpha(1);
                            tile["fadeTimer"] = null;
                        }
                    )
                    numTimers--;
                },
                17,
                untimedTiles
            )
            numTimers++;
            // Mark that the tiles passed in now have a timer for
            // when they should fade out
            untimedTiles.forEach(
                (tile) => {
                    tile["fadeTimer"] = timer;
                }
            )
        }
    }

    /**
     * Creates all the listerns used by this class, this also allows the file to stay organized as all the
     * listeners are listen in one place
     */
    createListeners() {
        this.handlers = {
            "newTileSelected": (incomingTile: tiledata) => {
                if (this.cursorTile) {
                    this.cursorTile.setTexture(incomingTile.tileSetKey, incomingTile.tileSetOffSet);
                } else {
                    //create build modes cursor tile
                    this.cursorTile = this.currentScene.add.sprite(0, 0, incomingTile.tileSetKey, incomingTile.tileSetOffSet);
                    //this.cursorTile.setOrigin(0,0);
                    this.cursorTile.setAlpha(.7);
                    this.cursorTile.setDepth(this.cursorDepth + 0.2);
                    this.cursorTile.setVisible(false);
                    this.cursorTile.rotation = Phaser.Math.DegToRad(this.rotation);
                    this.cursorTween = this.currentScene.tweens.add({
                        targets: this.cursorTile,
                        alpha: .3,
                        duration: 1000,
                        repeat: -1,
                        yoyo: true
                    });
                }
                this.currentTile = incomingTile;
            },
            "rotate block right-down": () => {
                this.rotation += 90;
                if (this.cursorTile) {
                    this.cursorTile.rotation = Phaser.Math.DegToRad(this.rotation);
                }
            },
            "rotate block left-down": () => {
                this.rotation -= 90;
                if (this.cursorTile) {
                    this.cursorTile.rotation = Phaser.Math.DegToRad(this.rotation);
                }
            },

            "enterBuildMode": () => {
                this.inBuildMode = true;
                if (this.cursorTile) {
                    this.cursorTween.resume();
                }
            },

            "exitBuildMode": () => {
                this.inBuildMode = false;
                this.toolCursor.setVisible(false);
                if (this.cursorTile) {
                    this.cursorTile.setVisible(false);
                    this.cursorTween.pause();
                }
            },

            "buildMenuHammerSelected": () => {
                this.toolSelected = "hammer";
                this.toolCursor.setTexture("hammerIcon");
            },
            "buildMenuPickSelected": () => {
                this.toolSelected = "pick";
                this.toolCursor.setTexture("pickIcon");
            },
            "buildingLayerChanged": (newCurrentLayer: string) => {
                this.layerSelected = newCurrentLayer;
                this.currentTile = null;
            },
            "clearBuildingLayer": (newCurrentLayer: string) => {
                this.layerSelected = "";
                this.currentTile = null;
            },
            "clearBuildingTool": (newCurrentLayer: string) => {
                this.toolSelected = "";
            }
        }

        /*take the keys and functions in this.handlers and bind them to this 
         scene then turn them on */
        for (let key of Object.keys(this.handlers)) {
            this.handlers[key].bind(this);
            this.signals.on(key, this.handlers[key]);
        }
    }

    /**Clears all the listeners in the global emitter from this class,
     * meant to be used when swapping scenes or before destroying this
     * class
     */
    clearListeners() {
        for (let key of Object.keys(this.handlers)) {
            let before = this.signals.listenerCount(key);
            this.signals.off(key, this.handlers[key]);
            let after = this.signals.listenerCount(key);
        }
    }
}

let numTimers = 0;