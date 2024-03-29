import { Console } from "../user-interface/Console";
import { SignalManager } from "../services/SignalManager";
import { CENTER, GAME_WIDTH } from "../tools/Globals";
import { Character } from "../actors/Character";

export class CharacterSheet {

    //member varibles

    //boolean
    /**This keep track of if the character sheet is currently visible */
    toggleVisible: boolean;

    //sprites
    /**This stores all the potrait sprites for the characters in a party, it does
     * so in the form of an array of objects where the objects hold the spritekey
     * and the sprite it's self, the spritekey is stored so we can refrence that
     * sprite more easily */
    portraitIcons: Phaser.GameObjects.Sprite[];
    /**The outline of a man used in the character sheet */
    outlineOfMan: Phaser.GameObjects.Sprite;
    /**Button used to toggle the character sheet */
    characterSheetButton: Phaser.GameObjects.Sprite;
    /**The portrait that goes to the top left of the sheet */
    sheetPortrait: Phaser.GameObjects.Sprite;

    //graphics
    /**This is the backdrop for the character sheet */
    Background: Phaser.GameObjects.Graphics;
    /**Block used as a backdrop for the number representing Focus */
    FocusBlock: Phaser.GameObjects.Graphics;
    /**Block used as a backdrop for the number representing Endurance */
    EnduranceBlock: Phaser.GameObjects.Graphics;
    /**Block used as a backdrop for the number representing Speed */
    SpeedBlock: Phaser.GameObjects.Graphics;
    /**Block used as a backdrop for the number representing Might */
    MightBlock: Phaser.GameObjects.Graphics;
    /**This is the area where you can click and drag the character sheet window */
    dragZone: Phaser.GameObjects.Graphics;
    

    //text
    /**Text representing the character's Name */
    Name: Phaser.GameObjects.Text;
    /**Text representing the character's Level */
    Level: Phaser.GameObjects.Text;
    /**Text representing the character's amount of EXP */
    EXP: Phaser.GameObjects.Text;
    /**Labeling Text put above the text for the character's Focus*/
    FocusLabel: Phaser.GameObjects.Text;
    /**Labeling Text put above the text for the character's Endurance*/
    EnduranceLabel: Phaser.GameObjects.Text;
    /**Labeling Text put above the text for the character's Speed*/
    SpeedLabel: Phaser.GameObjects.Text;
    /**Labeling Text put above the text for the character's Might*/
    MightLabel: Phaser.GameObjects.Text;
    /**Text representing the character's Level Focus*/
    FocusText: Phaser.GameObjects.Text;
    /**Text representing the character's Level Endurance*/
    EnduranceText: Phaser.GameObjects.Text;
    /**Text representing the character's Level Speed*/
    SpeedText: Phaser.GameObjects.Text;
    /**Text representing the character's Level Might*/
    MightText: Phaser.GameObjects.Text;
    /**Text representing the character's Level Life*/
    LifeText: Phaser.GameObjects.Text;
    /**Text representing the character's Level Energy*/
    EnergyText: Phaser.GameObjects.Text;
    /**Text representing the character's Level BattleSpeed*/
    BattleSpeedText: Phaser.GameObjects.Text;

    //global events emitter
    eventEmitter: SignalManager;

    //characters
    /**A refernce to the players's array of characters that make up their party */
    party: Character[];

    //scene
    currentScene: Phaser.Scene;

    //numbers
    depth: number;

    /**Constructs an instance of this class and initializes all the data, 
     * graphics are initially created in the createToggleButton and
     * createCharacterSheet functions
     * @param scene The Phaser scene to construct the character sheet within
     */
    constructor(scene: Phaser.Scene){
        //inital values
        this.currentScene = scene;
        this.toggleVisible = false;
        this.eventEmitter = SignalManager.get();
        this.party = [];
        this.portraitIcons = [];
        this.eventEmitter.on("partyChange", this.partyChange, this);
        this.depth = 0;
    }

    /**Constructs an instance of this class and creates all the internal sprites
     * and graghics.
     * @param x where to place the toggle button on the x coordinate place
     * @param y where to place the toggle button on the y coordinate place
     */
    createToggleButton(x: number, y: number){
        this.characterSheetButton = this.currentScene.add.sprite(x,y,"bookIcon");
        this.characterSheetButton.setScale(.8);
        this.characterSheetButton.setInteractive();
        this.characterSheetButton.on("pointerdown", this.toggle, this);
    }

    /**
     * Sets the depth for just the toggle button 
     * @param newDepth The depth to set the toggle button at
     */
    setToggleButtonDepth(newDepth: number){
        this.characterSheetButton.setDepth(newDepth);
    }

    /**
     * Sets the depth for the whole character sheet
     * @param newDepth The depth to set the toggle button at
     */
    setDepth(newDepth: number){
        this.depth = newDepth;
        this.Background.setDepth(newDepth);

        newDepth += 0.1;
        this.dragZone.setDepth(newDepth);
        this.sheetPortrait.setDepth(newDepth);
        this.Name.setDepth(newDepth);
        this.Level.setDepth(newDepth);
        this.EXP.setDepth(newDepth);
        this.FocusLabel.setDepth(newDepth);
        this.SpeedLabel.setDepth(newDepth);
        this.EnduranceLabel.setDepth(newDepth);
        this.MightLabel.setDepth(newDepth);
        this.FocusBlock.setDepth(newDepth);
        this.MightBlock.setDepth(newDepth);
        this.SpeedBlock.setDepth(newDepth);
        this.EnduranceBlock.setDepth(newDepth);
        this.LifeText.setDepth(newDepth);
        this.FocusText.setDepth(newDepth);
        this.MightText.setDepth(newDepth);
        this.SpeedText.setDepth(newDepth);
        this.EnergyText.setDepth(newDepth);
        this.EnduranceText.setDepth(newDepth);
        this.BattleSpeedText.setDepth(newDepth);
        for(let i = 0; i < this.portraitIcons.length; i++){
            this.portraitIcons[i].setDepth(newDepth);
        }
    }

    /**Initially creates all the visual elements for the class, this is done
    after the constructor so that the class can still listen for global events
    before it's visual elements are constructed, it is first created with all
    place holder values and keep these until a party is created for the player */
    createCharacterSheet(){
        //create the sheet background
        this.Background = this.currentScene.add.graphics();
        this.Background.fillStyle(0xb06e27,1);
        this.Background.lineStyle(20,0x915b20,1)
        this.Background.strokeRoundedRect(440, 60, 400, 600,20)
        this.Background.fillRoundedRect(440, 60, 400, 600,20);
        /*create drag zone, we use the graghic as an invisible, clickable zone.
        we attach a function that will reposition everything as it moves based on
        dragging done on this zone, this zone is also often used to see if the graphics
        have been created yet */
        this.dragZone = this.currentScene.add.graphics();
        this.dragZone.fillStyle(0xa80000,0);
        this.dragZone.fillRoundedRect(440, 50, 400, 30,20);
        this.dragZone.setInteractive(new Phaser.Geom.Rectangle(440, 50, 400, 30), Phaser.Geom.Rectangle.Contains);
        this.currentScene.input.setDraggable(this.dragZone,true);
        this.dragZone.on("drag", this.startDrag, this);
        //create the sheet portrait, this will have it's texture changed as need be
        this.sheetPortrait = this.currentScene.add.sprite(460, 80,"gregThePortrait");
        this.sheetPortrait.setOrigin(0);
        this.sheetPortrait.setScale(2);
        //create text config
        let textConfig = {
            fontSize: "20px",
            color: "#000000",
            fontFamily: 'Courier'
        }
        //create portrait side text
        this.Name = this.currentScene.add.text(570,100,"Greg the Test Dummy",textConfig);
        this.Name.setOrigin(0,.5);
        this.Level = this.currentScene.add.text(570,125,"Level: 5",textConfig);
        this.Level.setOrigin(0,.5);
        this.EXP = this.currentScene.add.text(570,150,"EXP: 3,486",textConfig);
        this.EXP.setOrigin(0,.5);
        //create stats labels
        this.FocusLabel = this.currentScene.add.text(490,215,"Focus:",textConfig);
        this.FocusLabel.setOrigin(.5,.5);
        this.FocusLabel.setFontSize(16);
        this.EnduranceLabel = this.currentScene.add.text(590,215,"Endurance:",textConfig);
        this.EnduranceLabel.setOrigin(.5,.5);
        this.EnduranceLabel.setFontSize(16);
        this.SpeedLabel = this.currentScene.add.text(690,215,"Speed:",textConfig);
        this.SpeedLabel.setOrigin(.5,.5);
        this.SpeedLabel.setFontSize(16);
        this.MightLabel = this.currentScene.add.text(790,215,"Might:",textConfig);
        this.MightLabel.setOrigin(.5,.5);
        this.MightLabel.setFontSize(16);
        //add blocks for stats
        this.FocusBlock = this.currentScene.add.graphics();
        this.FocusBlock.fillStyle(0x915b20,1);
        this.FocusBlock.lineStyle(15,0x784b1a,1)
        this.FocusBlock.strokeRoundedRect(460, 235, 60, 60,10)
        this.FocusBlock.fillRoundedRect(460, 235, 60, 60,10);
        this.EnduranceBlock = this.currentScene.add.graphics();
        this.EnduranceBlock.fillStyle(0x915b20,1);
        this.EnduranceBlock.lineStyle(15,0x784b1a,1)
        this.EnduranceBlock.strokeRoundedRect(560, 235, 60, 60,10)
        this.EnduranceBlock.fillRoundedRect(560, 235, 60, 60,10);
        this.SpeedBlock = this.currentScene.add.graphics();
        this.SpeedBlock.fillStyle(0x915b20,1);
        this.SpeedBlock.lineStyle(15,0x784b1a,1)
        this.SpeedBlock.strokeRoundedRect(660, 235, 60, 60,10)
        this.SpeedBlock.fillRoundedRect(660, 235, 60, 60,10);
        this.MightBlock = this.currentScene.add.graphics();
        this.MightBlock.fillStyle(0x915b20,1);
        this.MightBlock.lineStyle(15,0x784b1a,1)
        this.MightBlock.strokeRoundedRect(760, 235, 60, 60,10)
        this.MightBlock.fillRoundedRect(760, 235, 60, 60,10);
        //add stat text
        this.FocusText = this.currentScene.add.text(490,265,"10",textConfig);
        this.FocusText.setOrigin(.5,.5);
        this.FocusText.setFontSize(24);
        this.FocusText.setColor("white");
        this.EnduranceText = this.currentScene.add.text(590,265,"7",textConfig);
        this.EnduranceText.setOrigin(.5,.5);
        this.EnduranceText.setFontSize(24);
        this.EnduranceText.setColor("white");
        this.SpeedText = this.currentScene.add.text(690,265,"8",textConfig);
        this.SpeedText.setOrigin(.5,.5);
        this.SpeedText.setFontSize(24);
        this.SpeedText.setColor("white");
        this.MightText = this.currentScene.add.text(790,265,"2",textConfig);
        this.MightText.setOrigin(.5,.5);
        this.MightText.setFontSize(24);
        this.MightText.setColor("white");
        //indirect stats text
        this.LifeText = this.currentScene.add.text(460,330,"Life: 100",textConfig);
        this.LifeText.setOrigin(0,.5);
        this.LifeText.setFontSize(18);
        this.EnergyText = this.currentScene.add.text(460,355,"Energy: 100",textConfig);
        this.EnergyText.setOrigin(0,.5);
        this.EnergyText.setFontSize(18);
        this.BattleSpeedText = this.currentScene.add.text(460,380,"Battle Speed: 5",textConfig);
        this.BattleSpeedText.setOrigin(0,.5);
        this.BattleSpeedText.setFontSize(18);
        //add sprite of the outline of a man
        this.outlineOfMan = this.currentScene.add.sprite(CENTER.x, 535,"outlineOfMan");
        this.outlineOfMan.setOrigin(.5,.5);

        //default the above values to the party leader if we have set a party
        if (this.party.length > 0){
            this.updateSheet(this.party[0]);
        }

        //set the character sheet to not be visible upon creation
        this.SetVisibility(false);
    }

    /**Set the visibility of the character sheet. This is based on
     * this.toggleVisible. To straight set the visibility use
     * SetVisibility
     */
    toggle(){
        if(this.toggleVisible){
            this.Background.setVisible(false);
            this.sheetPortrait.setVisible(false);
            this.Name.setVisible(false);
            this.Level.setVisible(false);
            this.EXP.setVisible(false);
            this.FocusLabel.setVisible(false);
            this.EnduranceLabel.setVisible(false);
            this.SpeedLabel.setVisible(false);
            this.MightLabel.setVisible(false);
            this.FocusBlock.setVisible(false);
            this.EnduranceBlock.setVisible(false);
            this.SpeedBlock.setVisible(false);
            this.MightBlock.setVisible(false);
            this.FocusText.setVisible(false);
            this.EnduranceText.setVisible(false);
            this.SpeedText.setVisible(false);
            this.MightText.setVisible(false);
            this.LifeText.setVisible(false);
            this.EnergyText.setVisible(false);
            this.BattleSpeedText.setVisible(false);
            this.outlineOfMan.setVisible(false);
            this.dragZone.setVisible(false);
            //portrait icons
            for(let i = 0; i < this.portraitIcons.length; i++){
                this.portraitIcons[i].setVisible(false);
            }
            this.toggleVisible = false;
        } else {
            this.Background.setVisible(true);
            this.sheetPortrait.setVisible(true);
            this.Name.setVisible(true);
            this.Level.setVisible(true);
            this.EXP.setVisible(true);
            this.FocusLabel.setVisible(true);
            this.EnduranceLabel.setVisible(true);
            this.SpeedLabel.setVisible(true);
            this.MightLabel.setVisible(true);
            this.FocusBlock.setVisible(true);
            this.EnduranceBlock.setVisible(true);
            this.SpeedBlock.setVisible(true);
            this.MightBlock.setVisible(true);
            this.FocusText.setVisible(true);
            this.EnduranceText.setVisible(true);
            this.SpeedText.setVisible(true);
            this.MightText.setVisible(true);
            this.LifeText.setVisible(true);
            this.EnergyText.setVisible(true);
            this.BattleSpeedText.setVisible(true);
            this.outlineOfMan.setVisible(true);
            this.dragZone.setVisible(true);
            //portrait icons
            for(let i = 0; i < this.portraitIcons.length; i++){
                this.portraitIcons[i].setVisible(true);
            }
            this.toggleVisible = true;
        }
    }

    /**Set the visibility of the character sheet, the value is
     * passed in.
     * @param toggle boolean value telling to show the character sheet or not
     */
    SetVisibility(toggle: boolean){
        if(!toggle){
            this.Background.setVisible(false);
            this.sheetPortrait.setVisible(false);
            this.Name.setVisible(false);
            this.Level.setVisible(false);
            this.EXP.setVisible(false);
            this.FocusLabel.setVisible(false);
            this.EnduranceLabel.setVisible(false);
            this.SpeedLabel.setVisible(false);
            this.MightLabel.setVisible(false);
            this.FocusBlock.setVisible(false);
            this.EnduranceBlock.setVisible(false);
            this.SpeedBlock.setVisible(false);
            this.MightBlock.setVisible(false);
            this.FocusText.setVisible(false);
            this.EnduranceText.setVisible(false);
            this.SpeedText.setVisible(false);
            this.MightText.setVisible(false);
            this.LifeText.setVisible(false);
            this.EnergyText.setVisible(false);
            this.BattleSpeedText.setVisible(false);
            this.outlineOfMan.setVisible(false);
            this.dragZone.setVisible(false);
            //portrait icons
            for(let i = 0; i < this.portraitIcons.length; i++){
                this.portraitIcons[i].setVisible(false);
            }
            this.toggleVisible = false;
        } else {
            this.Background.setVisible(true);
            this.sheetPortrait.setVisible(true);
            this.Name.setVisible(true);
            this.Level.setVisible(true);
            this.EXP.setVisible(true);
            this.FocusLabel.setVisible(true);
            this.EnduranceLabel.setVisible(true);
            this.SpeedLabel.setVisible(true);
            this.MightLabel.setVisible(true);
            this.FocusBlock.setVisible(true);
            this.EnduranceBlock.setVisible(true);
            this.SpeedBlock.setVisible(true);
            this.MightBlock.setVisible(true);
            this.FocusText.setVisible(true);
            this.EnduranceText.setVisible(true);
            this.SpeedText.setVisible(true);
            this.MightText.setVisible(true);
            this.LifeText.setVisible(true);
            this.EnergyText.setVisible(true);
            this.BattleSpeedText.setVisible(true);
            this.outlineOfMan.setVisible(true);
            this.dragZone.setVisible(true);
            //portrait icons
            for(let i = 0; i < this.portraitIcons.length; i++){
                this.portraitIcons[i].setVisible(true);
            }
            this.toggleVisible = true;
        }
    }

    /**This takes all the objects and moves the as an offset from the position of the
     * drag zone, by default graghics are created with the x and y at 0,0 and just constructed
     * as an offset, as such everything is moved from an offset of the dragzone that is an offset
     * from where is is first drawn. This allows the entire windows to be drug around and placed
     * where every a player may want to move it to.
     * @param garbage garbage pointer data we don't use but needs to be passed in to access other data
     * @param dragX the amount dragzone has been drug from it's original point on the x axis
     * @param dragY the amount dragzone has been drug from it's original point on the y axis
     * 
     */
    startDrag(garbage: object, dragX: number, dragY: number){
        //round our dragx numbers it tends to make things less blurry
        dragX = Math.round(dragX);
        dragY = Math.round(dragY);
        /*do to how graghics are renders they start at 0,0 position wise 
        not matter where they are are drawn, this is a happy feature */
        this.dragZone.x = dragX;
        this.dragZone.y = dragY;
        this.Background.x = dragX;
        this.Background.y = dragY;
        this.FocusBlock.x = dragX;
        this.FocusBlock.y = dragY;
        this.EnduranceBlock.x = dragX;
        this.EnduranceBlock.y = dragY;
        this.SpeedBlock.x = dragX;
        this.SpeedBlock.y = dragY;
        this.MightBlock.x = dragX;
        this.MightBlock.y = dragY;
        //all not graghics objects must be done by offset
        this.sheetPortrait.x = this.dragZone.x + 460;
        this.sheetPortrait.y = this.dragZone.y + 80;
        this.Name.x = this.dragZone.x + 570;
        this.Name.y = this.dragZone.y + 100;
        this.Level.x = this.dragZone.x + 570;
        this.Level.y = this.dragZone.y + 125;
        this.EXP.x = this.dragZone.x + 570;
        this.EXP.y = this.dragZone.y + 150;
        this.FocusLabel.x = this.dragZone.x + 490;
        this.FocusLabel.y = this.dragZone.y + 215;
        this.EnduranceLabel.x = this.dragZone.x + 590;
        this.EnduranceLabel.y = this.dragZone.y + 215;
        this.SpeedLabel.x = this.dragZone.x + 690;
        this.SpeedLabel.y = this.dragZone.y + 215;
        this.MightLabel.x = this.dragZone.x + 790;
        this.MightLabel.y = this.dragZone.y + 215;
        this.FocusText.x = this.dragZone.x + 490;
        this.FocusText.y = this.dragZone.y + 265;
        this.EnduranceText.x = this.dragZone.x + 590;
        this.EnduranceText.y = this.dragZone.y + 265;
        this.SpeedText.x = this.dragZone.x + 690;
        this.SpeedText.y = this.dragZone.y + 265;
        this.MightText.x = this.dragZone.x + 790;
        this.MightText.y = this.dragZone.y + 265;
        this.LifeText.x = this.dragZone.x + 460;
        this.LifeText.y = this.dragZone.y + 330;
        this.EnergyText.x = this.dragZone.x + 460;
        this.EnergyText.y = this.dragZone.y + 355;
        this.BattleSpeedText.x = this.dragZone.x + 460;
        this.BattleSpeedText.y = this.dragZone.y + 380;
        this.outlineOfMan.x = this.dragZone.x + 640;
        this.outlineOfMan.y = this.dragZone.y + 535;
        //drag portrait icons
        for(let i = 0; i < this.party.length; i++){
            this.portraitIcons[i].x = this.dragZone.x + 860;
            this.portraitIcons[i].y = this.dragZone.y + ((55 * i) + 90);
        }
    }

    /**This changes all the text and portrait of the sheet to match the values
     * of a passed in character
     * @param character The character which the sprite sheet's data should currently
     * reflect
     */
    updateSheet(character: Character){
        //update all the test elements
        this.Name.setText(character.data.name);
        this.Level.setText("Level: " + character.data.level.toString());
        this.EXP.setText("EXP: " + character.data.exp.toString());
        this.FocusText.setText(character.data.focus.toString());
        this.EnduranceText.setText(character.data.endurance.toString());
        this.SpeedText.setText(character.data.speed.toString());
        this.MightText.setText(character.data.might.toString());
        this.LifeText.setText("Life: " + character.data.life.toString());
        this.EnergyText.setText("Energy: " + character.data.energy.toString());
        this.BattleSpeedText.setText("Battle Speed: " + character.data.battleSpeed.toString());
        //update the portrait
        this.sheetPortrait.setTexture(`${character.key}-portrait`);
    }

    /**A function ran when ever the global event "partyChange" is heard. This denotes that
     * the party has changed members in some way (and not just member order). As such we make
     * sure to relist the characters along the side of the character sheet to reflect the new
     * party members
     * @param newParty A copy of the new party after what ever member changes were just made
     */
    partyChange(newParty){
        this.party = newParty;
        //first we set what we already have to have the correct values
        for(let i = 0; i < this.party.length && i < this.portraitIcons.length; i++){
            this.portraitIcons[i].setTexture(`${this.party[i].key}-portrait`);
        }
        //now if needed we create more
        for(let i = this.portraitIcons.length; i < this.party.length; i++){
            let newIcon: Phaser.GameObjects.Sprite;
            //check if dragzone exists and either create to it or to 0,0 where it will be created
            if(this.dragZone){
                newIcon = this.currentScene.add.sprite(this.dragZone.x + 860,this.dragZone.y + ((55 * i) + 90),`${this.party[i].key}-portrait`);
            } else {
                newIcon = this.currentScene.add.sprite(860,(55 * i) + 90,`${this.party[i].key}-portrait`);
            }
            //check if the character sheet is currently open
            if(!this.toggleVisible){
                newIcon.setVisible(false);
            }
            newIcon.setScale(.75)
            newIcon.setDepth(this.depth);
            newIcon.setInteractive();
            newIcon.on("pointerdown", () => {this.updateSheet(this.party[i])});
            this.portraitIcons[i] = newIcon;
        }
        /*lastly we delete and that we no longer need, this removes them off screen and
            deletes and data linked to it */
        for (let i = this.party.length; i < this.portraitIcons.length; i++){
            this.portraitIcons[i].destroy();
        }
        /*this removes the now empty elements in the array leaving no ties to the previous
            Icons allowing them to go to garbage collection */
        this.portraitIcons.slice(this.party.length);

        /*use the new party leader as the default until a character icon is clicked, dragzone
        is used here as a way of checking the all the assets changed in updatesheet have been
        created */
        if(this.party.length > 0 && this.dragZone){
        this.updateSheet(this.party[0]);
        }
    }
}