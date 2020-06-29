import { Console } from "../tools/Console";
import { EventGlobals } from "../tools/EventGlobals";
import { CENTER } from "../tools/Globals";
import { Character } from "./Character";

export class CharacterSheet {

    //member varibles

    //boolean
    /**This keep track of if the character sheet is currently visible */
    ToggleVisible: boolean;

    //sprites
    /**This stores all the potrait sprites for the characters in a party, it does
     * so in the form of an array of objects where the objects hold the spritekey
     * and the sprite it's self, the spritekey is stored so we can refrence that
     * sprite more easily */
    portraitIcons: { [index: number]: Phaser.GameObjects.Sprite };
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
    MightLebel: Phaser.GameObjects.Text;
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
    eventEmitter: EventGlobals;

    //characters
    /**A refernce to the players's array of characters that make up their party */
    party: Character[];

    //scene
    currentScene: Phaser.Scene;

    /**Constructs an instance of this class and creates all the internal sprites
     * and graghics.
     * @param scene The Phaser scene to construct the character sheet within
     * @param x where to place the toggle button on the x coordinate place
     * @param y where to place the toggle button on the y coordinate place
     */
    constructor(scene: Phaser.Scene){
        //inital values
        this.currentScene = scene;
        this.ToggleVisible = false;
        this.eventEmitter = EventGlobals.getInstance();
        this.party = [];
        this.eventEmitter.on("partyChange", this.partyChange, this);
    }

    createToggleButton(x: number, y: number){
        this.characterSheetButton = this.currentScene.add.sprite(x,y,"bookIcon");
        this.characterSheetButton.setDepth(2);
        this.characterSheetButton.setScale(.8);
        this.characterSheetButton.setInteractive();
        this.characterSheetButton.on("pointerdown", this.toggle, this);
    }

    /**Allows the linking of all the sprites and graghics to
     * a given scene, this class will most likely only ever be
     * used in the main hud scene so I doubt I'l need it but just
     * in case.
     */
    link(scene: Phaser.Scene){
        this.currentScene = scene;
        this.currentScene.add.existing(this.characterSheetButton)
        this.currentScene.add.existing(this.Background);
        this.currentScene.add.existing(this.sheetPortrait);
        this.currentScene.add.existing(this.Name);
        this.currentScene.add.existing(this.Level);
        this.currentScene.add.existing(this.EXP);
        this.currentScene.add.existing(this.FocusLabel);
        this.currentScene.add.existing(this.EnduranceLabel);
        this.currentScene.add.existing(this.SpeedLabel);
        this.currentScene.add.existing(this.MightLebel);
        this.currentScene.add.existing(this.FocusBlock);
        this.currentScene.add.existing(this.EnduranceBlock);
        this.currentScene.add.existing(this.SpeedBlock);
        this.currentScene.add.existing(this.MightBlock);
        this.currentScene.add.existing(this.FocusText);
        this.currentScene.add.existing(this.EnduranceText);
        this.currentScene.add.existing(this.SpeedText);
        this.currentScene.add.existing(this.MightText);
        this.currentScene.add.existing(this.LifeText);
        this.currentScene.add.existing(this.EnergyText);
        this.currentScene.add.existing(this.BattleSpeedText);
        this.currentScene.add.existing(this.outlineOfMan);
    }

    createCharacterSheet(){
        //create background
        this.Background = this.currentScene.add.graphics();
        this.Background.fillStyle(0xb06e27,1);
        this.Background.lineStyle(20,0x915b20,1)
        this.Background.strokeRoundedRect(440, 60, 400, 600,20)
        this.Background.fillRoundedRect(440, 60, 400, 600,20);
        this.Background.setScale(0);
        /*create drag zone, we use the graghic to generate a sprite that can then be draggable
        and run a function when it is. This function will reposition everything as it moves */
        this.dragZone = this.currentScene.add.graphics();
        this.dragZone.fillStyle(0xa80000,0);
        this.dragZone.setScale(1);
        this.dragZone.fillRoundedRect(440, 50, 400, 30,20);
        this.dragZone.setInteractive(new Phaser.Geom.Rectangle(440, 50, 400, 30), Phaser.Geom.Rectangle.Contains);
        this.currentScene.input.setDraggable(this.dragZone,true);
        this.dragZone.on("drag", this.startDrag, this);
        this.sheetPortrait = this.currentScene.add.sprite(460, 80,"gregThePortrait");
        this.sheetPortrait.setOrigin(0);
        this.sheetPortrait.setScale(0);
        //create text config
        let textConfig = {
            fontSize: "20px",
            color: "#000000",
            fontFamily: 'Courier'
        }
        //create portrait side text
        this.Name = this.currentScene.add.text(570,100,"Greg the Test Dummy",textConfig);
        this.Name.setOrigin(0,.5);
        this.Name.setScale(0);
        this.Level = this.currentScene.add.text(570,125,"Level: 5",textConfig);
        this.Level.setOrigin(0,.5);
        this.Level.setScale(0);
        this.EXP = this.currentScene.add.text(570,150,"EXP: 3,486",textConfig);
        this.EXP.setOrigin(0,.5);
        this.EXP.setScale(0);
        //create stats labels
        this.FocusLabel = this.currentScene.add.text(490,215,"Focus:",textConfig);
        this.FocusLabel.setOrigin(.5,.5);
        this.FocusLabel.setScale(0);
        this.FocusLabel.setFontSize(16);
        this.EnduranceLabel = this.currentScene.add.text(590,215,"Endurance:",textConfig);
        this.EnduranceLabel.setOrigin(.5,.5);
        this.EnduranceLabel.setScale(0);
        this.EnduranceLabel.setFontSize(16);
        this.SpeedLabel = this.currentScene.add.text(690,215,"Speed:",textConfig);
        this.SpeedLabel.setOrigin(.5,.5);
        this.SpeedLabel.setScale(0);
        this.SpeedLabel.setFontSize(16);
        this.MightLebel = this.currentScene.add.text(790,215,"Might:",textConfig);
        this.MightLebel.setOrigin(.5,.5);
        this.MightLebel.setScale(0);
        this.MightLebel.setFontSize(16);
        //add blocks for stats
        this.FocusBlock = this.currentScene.add.graphics();
        this.FocusBlock.fillStyle(0x915b20,1);
        this.FocusBlock.lineStyle(15,0x784b1a,1)
        this.FocusBlock.strokeRoundedRect(460, 235, 60, 60,10)
        this.FocusBlock.fillRoundedRect(460, 235, 60, 60,10);
        this.FocusBlock.setScale(0);
        this.EnduranceBlock = this.currentScene.add.graphics();
        this.EnduranceBlock.fillStyle(0x915b20,1);
        this.EnduranceBlock.lineStyle(15,0x784b1a,1)
        this.EnduranceBlock.strokeRoundedRect(560, 235, 60, 60,10)
        this.EnduranceBlock.fillRoundedRect(560, 235, 60, 60,10);
        this.EnduranceBlock.setScale(0);
        this.SpeedBlock = this.currentScene.add.graphics();
        this.SpeedBlock.fillStyle(0x915b20,1);
        this.SpeedBlock.lineStyle(15,0x784b1a,1)
        this.SpeedBlock.strokeRoundedRect(660, 235, 60, 60,10)
        this.SpeedBlock.fillRoundedRect(660, 235, 60, 60,10);
        this.SpeedBlock.setScale(0);
        this.MightBlock = this.currentScene.add.graphics();
        this.MightBlock.fillStyle(0x915b20,1);
        this.MightBlock.lineStyle(15,0x784b1a,1)
        this.MightBlock.strokeRoundedRect(760, 235, 60, 60,10)
        this.MightBlock.fillRoundedRect(760, 235, 60, 60,10);
        this.MightBlock.setScale(0);
        //add stat text
        this.FocusText = this.currentScene.add.text(490,265,"10",textConfig);
        this.FocusText.setOrigin(.5,.5);
        this.FocusText.setScale(0);
        this.FocusText.setFontSize(24);
        this.FocusText.setColor("white");
        this.EnduranceText = this.currentScene.add.text(590,265,"7",textConfig);
        this.EnduranceText.setOrigin(.5,.5);
        this.EnduranceText.setScale(0);
        this.EnduranceText.setFontSize(24);
        this.EnduranceText.setColor("white");
        this.SpeedText = this.currentScene.add.text(690,265,"8",textConfig);
        this.SpeedText.setOrigin(.5,.5);
        this.SpeedText.setScale(0);
        this.SpeedText.setFontSize(24);
        this.SpeedText.setColor("white");
        this.MightText = this.currentScene.add.text(790,265,"2",textConfig);
        this.MightText.setOrigin(.5,.5);
        this.MightText.setScale(0);
        this.MightText.setFontSize(24);
        this.MightText.setColor("white");
        //indirect stats text
        this.LifeText = this.currentScene.add.text(460,330,"Life: 100",textConfig);
        this.LifeText.setOrigin(0,.5);
        this.LifeText.setScale(0);
        this.LifeText.setFontSize(18);
        this.EnergyText = this.currentScene.add.text(460,355,"Energy: 100",textConfig);
        this.EnergyText.setOrigin(0,.5);
        this.EnergyText.setScale(0);
        this.EnergyText.setFontSize(18);
        this.BattleSpeedText = this.currentScene.add.text(460,380,"Battle Speed: 5",textConfig);
        this.BattleSpeedText.setOrigin(0,.5);
        this.BattleSpeedText.setScale(0);
        this.BattleSpeedText.setFontSize(18);
        //add sprite of the outline of a man
        this.outlineOfMan = this.currentScene.add.sprite(CENTER.x, 535,"outlineOfMan");
        this.outlineOfMan.setOrigin(.5,.5);
        this.outlineOfMan.setScale(0);
    }

    toggle(){
        if(this.ToggleVisible){
            this.Background.setScale(0);
            this.sheetPortrait.setScale(0);
            this.Name.setScale(0);
            this.Level.setScale(0);
            this.EXP.setScale(0);
            this.FocusLabel.setScale(0);
            this.EnduranceLabel.setScale(0);
            this.SpeedLabel.setScale(0);
            this.MightLebel.setScale(0);
            this.FocusBlock.setScale(0);
            this.EnduranceBlock.setScale(0);
            this.SpeedBlock.setScale(0);
            this.MightBlock.setScale(0);
            this.FocusText.setScale(0);
            this.EnduranceText.setScale(0);
            this.SpeedText.setScale(0);
            this.MightText.setScale(0);
            this.LifeText.setScale(0);
            this.EnergyText.setScale(0);
            this.BattleSpeedText.setScale(0);
            this.outlineOfMan.setScale(0);
            this.ToggleVisible = false;
        } else {
            this.Background.setScale(1);
            this.sheetPortrait.setScale(2);
            this.Name.setScale(1);
            this.Level.setScale(1);
            this.EXP.setScale(1);
            this.FocusLabel.setScale(1);
            this.EnduranceLabel.setScale(1);
            this.SpeedLabel.setScale(1);
            this.MightLebel.setScale(1);
            this.FocusBlock.setScale(1);
            this.EnduranceBlock.setScale(1);
            this.SpeedBlock.setScale(1);
            this.MightBlock.setScale(1);
            this.FocusText.setScale(1);
            this.EnduranceText.setScale(1);
            this.SpeedText.setScale(1);
            this.MightText.setScale(1);
            this.LifeText.setScale(1);
            this.EnergyText.setScale(1);
            this.BattleSpeedText.setScale(1);
            this.outlineOfMan.setScale(1);
            this.ToggleVisible = true;
        }
    }

    startDrag(garbage: object, dragX: number, dragY: number){
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
        this.MightLebel.x = this.dragZone.x + 790;
        this.MightLebel.y = this.dragZone.y + 215;
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
    }

    updateSheet(character: Character){
        //update all the test elements
        this.Name.setText(character.name);
        this.Level.setText(character.level.toString());
        this.EXP.setText(character.exp.toString());
        this.FocusText.setText(character.focus.toString());
        this.EnduranceText.setText(character.endurance.toString());
        this.SpeedText.setText(character.speed.toString());
        this.MightText.setText(character.might.toString());
        this.LifeText.setText(character.life.toString());
        this.EnergyText.setText(character.energy.toString());
        this.BattleSpeedText.setText(character.battleSpeed.toString());
        //update the portrait
        this.sheetPortrait = new Phaser.GameObjects.Sprite(this.currentScene,this.dragZone.x + 460,this.dragZone.y + 80,character.portraitKey);
    }

    partyChange(newParty){
        if(true){
            this.party = newParty;
            this.portraitIcons = {};
            //run thru and create new icon for character sheets
            console.log(this.party,this.party.length);
            for (let i = 0; i < this.party.length; i++){
                let newIcon = this.currentScene.add.sprite(this.dragZone.x + 460,this.dragZone.y + 80 * i,this.party[i].portraitKey);
                newIcon.setDepth(200);
            }
        }
    }

}