// Sandboxed version creates an iframe sandbox to use for evals
function SandboxedTuttiClient(window, host, port, roomID, console){
    this.parentWindow = window
    this.console = console
    TuttiClient.call(this, null, host, port, roomID)
}
SandboxedTuttiClient.prototype = new TuttiClient()
SandboxedTuttiClient.prototype.constructor = SandboxedTuttiClient
SandboxedTuttiClient.prototype.sandboxIframe = null
// based on Dean Edwards' sandbox
SandboxedTuttiClient.prototype.createSandBox = function(callback){
    this.parentWindow.sandbox = null
    this.sandboxIframe = this.parentWindow.document.createElement("iframe")
    this.sandboxIframe.style.display = "none"
    this.sandboxIframe.src = '/blank.html'
    this.parentWindow.document.body.appendChild(this.sandboxIframe)
}
SandboxedTuttiClient.prototype.getWindow = function(){
    return this.sandboxIframe ? this.sandboxIframe.contentWindow : null
}
SandboxedTuttiClient.prototype.getDocument = function(){
    var win = this.getWindow()
    return win ? win.document: null
}
SandboxedTuttiClient.prototype.evalJS = function(s){
    return this.parentWindow.sandbox.eval(s)
}
SandboxedTuttiClient.prototype.setupConsole = function(){
    var self = this
    function consoleLog(msg){
        var data = {console: msg}
        self.sendData(data)
        self.notify('console', msg)
    }
    this.parentWindow.consoleLog = consoleLog
    this.createSandBox()
}
SandboxedTuttiClient.prototype.reset = function(){
    this.queue.add(new Command('reset', function(next){
        this.sandboxIframe.parentNode.removeChild(this.sandboxIframe)
        this.createSandBox()
        this.console.jqconsole.reset(next)
    }, this))
}
SandboxedTuttiClient.prototype.ready = function(){
    return this.parentWindow.sandbox && this.getDocument()
}