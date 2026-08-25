"use strict";

import { AxialComponentBase } from "../core/AxialComponentBase.js";

import { AxialServiceButton } from "../button/AxialServiceButton.js";
import { AxialMessage } from "./AxialMessage.js";
import { AxialTypingBubble } from "./AxialTypingBubble.js";
import { AxialWebSocket } from "../websocket/AxialWebSocket.js";
import { PathUtils } from "../utils/PathUtils.js";
import { FetchUtils } from "../utils/FetchUtils.js";
import { ObjectUtils } from "../utils/ObjectUtils.js";
import { ArrayUtils } from "../utils/ArrayUtils.js";
import { DomUtils } from "../utils/DomUtils.js";

import { AxialList } from "../list/AxialList.js";

import { AxialMessagingContactItem } from "./AxialMessagingContactItem.js";

class AxialMessaging extends AxialComponentBase
{
    /// vars
    /** @type { AxialWebSocket } */
    #websocket;

    /** @type { String } */
    #socketUrl;

    /** @type { Number } */
    #typingDelay = 2000;

    /** @type { Number } */
    #typingTimeoutId;

    /** @type { Boolean } */
    #isTyping = false;

    /** @type { String } */
    #userId;

    /** @type { String } */
    #userRole;

    /** @type { String } */
    #groupId;

    /** @type { Array } */
    #conversations;

    /** @type { Array } */
    #contacts;

    /** @type { Object } */ // the current conversation
    #currentConversation;

    /** @type { Array<Object> } */
    #currentMessages;

    /** @type { Number } */
    #conversationLimit = 40;

    /** @type { Boolean } */
    #initialized = false;

    /// api pathes
    /** @type { String } */
    #apiConversationCreatePath = "./api/conversation/create"; // create a new conversation

    /** @type { String } */
    #apiConversationListPath = "./api/conversation/list"; // list all the conversation

    /** @type { String } */
    #apiConversationContactsPath = "./api/conversation/contacts"; // get all the authorized contacts

    /** @type { String } */
    #apiMessageGetPath = "./api/message/get"; // get all the messages from a conversation an rebuild it

    /** @type { String } */
    #apiMessageCreatePath = "./api/message/create"; // create and save a message

    /** @type { String } */
    #apiMessagingSocketPath = "./api/messaging/socket"; // get the web socket url from env vars

    /// elements
    // messaging
    /** @type { HTMLElement } */
    #messages;

    /** @type { HTMLTextAreaElement } */
    #writeArea;

    /** @type { AxialServiceButton } */
    #sendButton;

    /** @type { HTMLElement } */
    #bubbleHolder;

    /** @type { AxialTypingBubble } */
    #typingBubble;

    // main and panel
    /** @type { HTMLElement } */
    #main;

    /** @type { HTMLElement } */
    #recipients;

    /** @type { HTMLElement } */
    #panel;

    /** @type { HTMLElement } */
    #contactState;

    /** @type { HTMLElement } */
    #welcomeState;

    /** @type { HTMLElement } */
    #errorState;

    /** @type { AxialButton } */
    #startButton;

    /** @type { AxialList } */
    #contactList;

    /// events
    /** @type { Function } */
    #boundKeydownHandler;

    /** @type { Function } */
    #boundInputHandler;

    /** @type { Function } */
    #boundSendHandler;

    /** @type { Function } */
    #boundTypingTimeoutHandler;

    /** @type { Function } */
    #boundStartHandler;

    /// socket
    /** @type { Function } */
    #boundSocketOpenHandler;

    /** @type { Function } */
    #boundSocketMessageHandler;

    /** @type { Function } */
    #boundSocketErrorHandler;

    /** @type { Function } */
    #boundSocketCloseHandler;

    /// axial
    /** @type { Function } */
    #boundAxialUserReadyHandler;

    /** @type { Function } */
    #boundConversationStartHandler;

    constructor()
    {
        super();
        this.classList.add("axial_messaging");
        this.template = "axial-messaging-template";

        this.#apiConversationListPath   = PathUtils.getPathFromRelative( this.#apiConversationListPath );
        this.#apiConversationCreatePath   = PathUtils.getPathFromRelative( this.#apiConversationCreatePath );
        this.#apiConversationContactsPath   = PathUtils.getPathFromRelative( this.#apiConversationContactsPath );

        this.#apiMessageGetPath   = PathUtils.getPathFromRelative( this.#apiMessageGetPath );
        this.#apiMessageCreatePath   = PathUtils.getPathFromRelative( this.#apiMessageCreatePath );

        this.#apiMessagingSocketPath   = PathUtils.getPathFromRelative( this.#apiMessagingSocketPath );

        this.#boundSocketOpenHandler    = this.#socketOpenHandler.bind(this);
        this.#boundSocketMessageHandler = this.#socketMessageHandler.bind(this);
        this.#boundSocketErrorHandler   = this.#socketErrorHandler.bind(this);
        this.#boundSocketCloseHandler   = this.#socketCloseHandler.bind(this);

        this.#boundKeydownHandler       = this.#keydownHandler.bind(this);
        this.#boundInputHandler         = this.#inputHandler.bind(this);
        this.#boundSendHandler          = this.#sendHandler.bind(this);
        this.#boundStartHandler         = this.#startHandler.bind(this);
        this.#boundTypingTimeoutHandler = this.#typingTimeoutHandler.bind(this);

        this.#boundAxialUserReadyHandler = this.#axialUserReadyHandler.bind(this);

        window.addEventListener( "axialUserReady", this.#boundAxialUserReadyHandler );

        this.#boundConversationStartHandler = this.#conversationStartHandler.bind(this);
    }

    #axialUserReadyHandler( event )
    {
        //console.log("axialUserReadyHandler", event);
        this.#userId = event.detail.user.uuid;
        this.#userRole = event.detail.user.role;

        this.#initMessaging();
    }

    /**
     *  @type { AxialWebSocket }
     *  @readonly
     */
    get websocket() { return this.#websocket; }

    get currentConversation() { return this.#currentConversation; }
    set currentConversation( value )
    {
        if( ObjectUtils.isObject( value ) === false )
        {
            throw new TypeError("Plain Object required");
        }
        this.#currentConversation = value;
        
        //console.log("currentConversation", this.#currentConversation);

        /// SUPER WARNING Here the logic is fixed assuling that a user always have only one contact
        /// BTW value.to or from will mathc uuids array
        if( this.#userRole === "user" )
        {
            const singleContact = this.#contacts[0];
            this.#recipients.innerHTML = singleContact.label;
        }
        else if( this.#userRole === "admin" )
        {
            for( const contact of this.#contacts )
            {
                if( contact.uuids[0] === this.#currentConversation.users[0] )
                {
                    this.#recipients.innerHTML = contact.label;
                    break;
                }
            }
        }
    }

    _buildComponent()
    {
        super._buildComponent();

        this.#main = this.shadowRoot.getElementById("main");
        this.#panel = this.shadowRoot.getElementById("panel");
        this.#contactState = this.shadowRoot.getElementById("contactState");
        this.#errorState = this.shadowRoot.getElementById("errorState");
        this.#welcomeState = this.shadowRoot.getElementById("welcomeState");

        this.#messages = this.shadowRoot.getElementById("messages");
        this.#writeArea = this.shadowRoot.getElementById("writeArea");
        this.#sendButton = this.shadowRoot.getElementById("sendButton");
        this.#startButton = this.shadowRoot.getElementById("startButton");

        this.#writeArea.addEventListener("keydown", this.#boundKeydownHandler);
        this.#writeArea.addEventListener("input", this.#boundInputHandler);

        this.#sendButton.addEventListener("click", this.#boundSendHandler);
        this.#sendButton.enabled = false;

        this.#startButton.addEventListener("click", this.#boundStartHandler);

        this.#bubbleHolder = this.shadowRoot.getElementById("bubbleHolder");
        this.#typingBubble = this.shadowRoot.getElementById("typingBubble");
        this.#recipients = this.shadowRoot.getElementById("recipients");

        this.#contactList = this.shadowRoot.getElementById("contactList");
        this.#contactList.itemClass = AxialMessagingContactItem;
        //this.#contactList.addEventListener("conversationStart", this.#boundConversationStart)

    }

    async init()
    { 
        try
        {
            if( this.#userId === undefined || this.#userRole === undefined )
            {
                throw new Error("Can't init messaging");
            }
            await this.#initMessaging();
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #initMessaging()
    {
        try
        {
            const socketJson = await FetchUtils.GET( this.#apiMessagingSocketPath );
            this.#socketUrl = `${socketJson.url}?u=${this.#userId}&r=${this.#userRole}`;
            this.#createSocket();
            await this.#getConversationContacts();
            await this.#getConversationList();

        }
        catch(err)
        {

        }
        finally
        {
            if( this.#websocket !== undefined && Array.isArray(this.#conversations) === true && Array.isArray(this.#contacts) === true )
            {
                this.#initialized = true;
            }
            this.#initMesagingInterface();
        }
    }

    async #initMesagingInterface()
    {
        //console.log("initMessagingData", this.#initialized);

        //console.log("conversations : ", this.#conversations);
        //console.log("contacts : ", this.#contacts);
        //console.log("websock : ", this.#websocket);

        // une erreur s'est produite, on ne peut pas utiliser la messagerie
        if( this.#initialized === false )
        {
            this.#errorState.style.display = "block";

            this.#welcomeState.style.display = "none";
            this.#contactState.style.display = "none";
        }
        else
        {
            // c'est parti !

            // encore aucune conversation (ni envoyée, ni reçue), on affiche l'état de bienvenue
            if( this.#conversations.length === 0 )
            {
                this.#welcomeState.style.display = "block";

                this.#errorState.style.display = "none";
                this.#contactState.style.display = "none";
            }
            // on a moins une conversation
            // -> l'utilisateur n'a qu'un seul contact : on affiche directement la conversation
            // -> sinon on affiche la liste des conversations
            else if( this.#conversations.length >= 1 )
            {
                if( this.#contacts.length === 1 )
                {
                    this.#main.style.display = "flex";
                    this.#panel.style.display = "none";

                    this.#welcomeState.style.display = "none";
                    this.#errorState.style.display = "none";
                    this.#contactState.style.display = "none";

                    const cc = this.#conversations[0];
                    //console.log( cc );
                    this.currentConversation = cc;
                    try
                    {
                        await this.#getCurrentMessages();
                    }
                    catch(err)
                    {
                        console.log(err);
                    }
                }
                else
                {
                    //console.warn("ON AFFICHE TOUTES LES CONVERSATIONS");
                    /// temp fix on affiche tous les contacts et on sélectionne le contact
                    this.#main.style.display = "none";
                    this.#panel.style.display = "block";

                    this.#welcomeState.style.display = "none";
                    this.#errorState.style.display = "none";
                    this.#contactState.style.display = "block";
                }
            }
        }
    }


    /**
     * Create the AxialWebSocket and its listeners
     */
    #createSocket()
    {
        // Silent fail socket already here
        if( this.#websocket ) { return; }

        // check again if #socketUrl isValid
        if( this.#socketUrl === undefined || typeof this.#socketUrl !== "string" )
        {
            throw new Error("Can't initialize the socket. The 'socketUrl' must be a string which start with the 'ws://' protocol");
        }

        this.#websocket = new AxialWebSocket( this.#socketUrl );

        this.#websocket.addEventListener( "socketOpen", this.#boundSocketOpenHandler );
        this.#websocket.addEventListener( "socketMessage", this.#boundSocketMessageHandler );
        this.#websocket.addEventListener( "socketError", this.#boundSocketErrorHandler );
        this.#websocket.addEventListener( "socketClose", this.#boundSocketCloseHandler );
    }

    #socketOpenHandler( event )
    {

    }

    #socketMessageHandler( event )
    {
        if( this.#currentConversation === undefined ) { return; }
        const object = JSON.parse( event.detail.message );
        //console.log("MESSAGE IN SOCKET", object);

        if( object.from === this.#userId ) { return; }
        if( object.conversation_id !== this.#currentConversation.uuid ) { return; }

        const type = object.type;
        switch( type )
        {
            case "typing":
                if( object.value === true )
                {
                    this.#showBubble();
                }
                else
                {
                    this.#hideBubble();
                }
            break;

            case "message":
                this.#hideBubble();
                this.#addMessageReceived( object );
            break;

            default:
            break;
        }
    }

    #socketErrorHandler( event )
    {

    }

    #socketCloseHandler( event )
    {

    }

    /**
     * 
     * @param { KeyboardEvent } event 
     */
    #keydownHandler( event )
    {
        if( event.key === "Enter" && event.getModifierState("Control") === true )
        {
            console.log("send the message on ctrl + enter");
        }
    }

    /**
     * 
     * @param { InputEvent } event 
     */
    #inputHandler( event )
    {
        if( this.#writeArea.value.trim() !== "" )
        {
            this.#sendButton.enabled = true;
        }
        else
        {
            this.#sendButton.enabled = false;
        }

        window.clearTimeout( this.#typingTimeoutId );
        this.#typingTimeoutId = window.setTimeout( this.#boundTypingTimeoutHandler, this.#typingDelay);

        

        if( this.#isTyping === false )
        {
            const object =
            {
                conversation_id: this.#currentConversation.uuid,
                from: this.#userId,
                type: "typing",
                value: true,
                content: ""
            };

            this.#isTyping = true;
            const json = JSON.stringify(object);
            this.websocket.send( json );
        }
        
    }

    #sendHandler( event )
    {
        this.#sendMessage();
    }

    /**
     * Quand on clique sur le bouton "démarrer une nouvelle conversation"
     * @param { PointerEvent } event 
     */
    async #startHandler( event )
    {
        await this.#getConversationContacts();
        await this.#getConversationList();
        // si on a 1 seul contact on crée directement la conversation
        // si on en a plusieurs on affiche l'écran de contact
        try
        {
            if( this.#contacts.length === 1 )
            {
                if( this.#conversations.length == 0 )
                {
                    // créer la conversation
                    const from = this.#userId;
                    const contact = this.#contacts[0];
                    const to = contact.uuids
                    const subject = "";

                    this.#recipients.innerHTML = contact.label;

                    const conv = await this.#createConversation(from, to, subject);
                }
                else // conversation = 1
                {
                    this.currentConversation = this.#conversations[0];
                }

                
                // afficher main
                this.#main.style.display = "flex";
                this.#panel.style.display = "none";

                this.#welcomeState.style.display = "none";
                this.#errorState.style.display = "none";
                this.#contactState.style.display = "none";

            }
            else
            {
                this.#welcomeState.style.display = "none";
                this.#errorState.style.display = "none";
                this.#contactState.style.display = "block";
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }

    /**
     * Send the message, we register first the message in the database
     * If success, we sen it to all the users throw the websockets
     * This ensure for the user the messages is properly saved before distribution
     */
    async #sendMessage()
    {
        try
        {
            const message = this.#writeArea.value.trim();

            const object = 
            {
                conversation_id: this.#currentConversation.uuid,
                from: this.#userId,
                type: "message",
                content: message,
                to: this.#currentConversation.uuids
                
            };
            
            const inserted = await FetchUtils.POST( this.#apiMessageCreatePath, object);

            if( this.websocket )
            {
                const messageString = JSON.stringify( object )
                this.websocket.send( messageString );
                this.#addMessageSent( object );
            }
        }
        catch(err)
        {
            console.log(err);
            // here we can toast the error
        }
        finally
        {
            // do not block the user and let it him rewrite
            this.#writeArea.value = "";
            this.#sendButton.enabled = false;
        }
    }

    #addMessageSent( message )
    {
        const sentMessage = new AxialMessage( message, "sent" );
        this.#messages.appendChild( sentMessage );

        this.#scrollDown();
    }

    #addMessageReceived( message )
    {
        const receivedMessage = new AxialMessage( message, "received" );
        this.#messages.appendChild( receivedMessage );
        this.#messages.parentElement.scrollTop = this.#messages.parentElement.scrollHeight;
    }
    
    #typingTimeoutHandler()
    {
        window.clearTimeout( this.#typingTimeoutId );
        const object =
        {
            conversation_id: this.#currentConversation.uuid,
            from: this.#userId,
            type: "typing",
            value: false
        };
        const json = JSON.stringify(object);
        this.websocket.send( json );
        this.#isTyping = false;
    }

    #scrollDown()
    {
        const parentHeight = this.#messages.parentElement.offsetHeight;
        const messageHeight = this.#messages.getBoundingClientRect().height;
        const delta = messageHeight - parentHeight;
        //console.log(parentHeight, messageHeight, delta);
    }

    #showBubble()
    {
        this.#typingBubble.start();
        this.#bubbleHolder.style.height = "56px";
    }

    #hideBubble()
    {
        this.#typingBubble.stop();
        this.#bubbleHolder.style.height = "0";
    }

    /**
     * 
     * @param { String } from 
     * @param { Array.<String> } to 
     * @param { String } subject 
     */
    async #createConversation( from, to, subject )
    {
        try
        {
            // control todo
            let canSend = true;
            const obj = { from: from, to: to, subject: subject }
            console.log(obj);
            
            const json = await FetchUtils.POST( this.#apiConversationCreatePath, obj );
            this.currentConversation = json.content;

            
            this.#main.style.display = "flex";
            this.#panel.style.display = "none";

            this.#welcomeState.style.display = "none";
            this.#errorState.style.display = "none";
            this.#contactState.style.display = "none";
            
        }
        catch(err)
        {
            console.log(err);
        }
    }

    async #getConversationList()
    {
        try
        {
            this.#conversations = new Array();
            const list = await FetchUtils.GET( this.#apiConversationListPath );
            //console.log( "conversations", list );
            if( list.content !== null && Array.isArray( list.content ) === true )
            {
                this.#conversations = list.content;
            }
        }
        catch(err)
        {

        }
    }

    async #getConversationContacts()
    {
        try
        {
            this.#contacts = new Array();
            const contacts = await FetchUtils.GET( this.#apiConversationContactsPath );
            //console.log("contacts", contacts );
            if( contacts.content !== null && Array.isArray( contacts.content ) === true )
            {
                this.#contacts = contacts.content;
                if( this.#contactList )
                {
                    this.#contactList.empty();
                    const items = this.#contactList.addManyItems(this.#contacts);
                    for( const contactItem of items )
                    {
                        contactItem.addEventListener("conversationStart", this.#boundConversationStartHandler);
                    }
                }
                const messagingEvent = new CustomEvent("messagingContact", { detail: { contacts: this.#contacts } } );
                this.dispatchEvent(messagingEvent);
            }
        }
        catch(err)
        {

        }
    }

    async #getCurrentMessages()
    {
        try
        {
            const query = `c=${this.#currentConversation.uuid}`;
            const messages = await FetchUtils.GET( this.#apiMessageGetPath, query );
            this.#currentMessages = messages.content;
            this.#displayConversation();
        }
        catch(err)
        {
            console.log(err);
        }
        finally
        {

        }
    }

    #displayConversation()
    {
        //console.log("this.#displayConversation")
        DomUtils.cleanElement( this.#messages );
        //console.log( this.#currentMessages );
        for( const mes of this.#currentMessages )
        {
            //console.log( mes );
            if( mes.from === this.#userId )
            {
                this.#addMessageSent( mes );
            }
            else
            {
                this.#addMessageReceived( mes );
            }
        }

        this.#main.style.display = "flex";
        this.#panel.style.display = "none";

        this.#welcomeState.style.display = "none";
        this.#errorState.style.display = "none";
        this.#contactState.style.display = "none";
    }

    /**
     * Qd on click un item
     * @param {CustomEvent} event 
     */
    async #conversationStartHandler( event )
    {
        console.log("conversation start");
        try
        {
            await this.#getConversationList();
            //console.log(event.detail)

            const uuids = event.detail.uuids;
            let hasConv = false;
            let testConv;
            for( const conv of this.#conversations )
            {
                const all = conv.users.concat( conv.admins );
                const uuidsSet = new Set(uuids);
                for( const a of all )
                {
                    if( uuidsSet.has(a) === true )
                    {
                        hasConv = true;
                        testConv = conv;
                        break;
                    }
                }
            }

            //console.log( testConv );
            if( testConv )
            {
                this.currentConversation = testConv;
                await this.#getCurrentMessages();
            }
            else
            {
                const newConv = this.#createConversation(this.#userId, uuids, "");
            }
        }
        catch(err)
        {

        }
    
    }

    async displayContact()
    {
        try
        {
            await this.#getConversationContacts();
        }
        catch(err)
        {
            console.log(err);
        }
        this.#main.style.display = "none";
        this.#panel.style.display = "block";

        this.#welcomeState.style.display = "none";
        this.#errorState.style.display = "none";
        this.#contactState.style.display = "block";
    }

}

window.customElements.define("axial-messaging", AxialMessaging);
export { AxialMessaging }