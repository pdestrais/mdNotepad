export type TButton = {
  title?: string,
  command?: string,
  styleClass?: string,
  pluginName?: string,
  isComplex?: boolean
};

export type TButtonLibrary = {
  [name: string]: TButton
};

export class NgxWigToolbarService {

  private _buttonLibrary: TButtonLibrary = {
    uList: {title: 'Unordered List', command: 'insertUnorderedList', styleClass: 'list-ul'},
    oList: {title: 'Ordered List', command: 'insertOrderedList', styleClass: 'list-ol'},
    bold: {title: 'Bold', command: 'bold', styleClass: 'bold'},
    italic: {title: 'Italic', command: 'italic', styleClass: 'italic'},
    link: {title: 'Link', command: 'createLink', styleClass: 'link'},
    underline: {title: 'Underline', command: 'underline', styleClass: 'format-underlined' },
    heading1: {title:'Insert Heading 1', command: 'insertHeading1', styleClass: 'heading1'},
    heading2: {title:'Insert Heading 2', command: 'insertHeading2', styleClass: 'heading2'},
    heading3: {title:'Insert Heading 3', command: 'insertHeading3', styleClass: 'heading3'},
    quote: {title:'Insert quote', command: 'insertQuote', styleClass: 'quote'},
    code: {title:'Insert code', command: 'insertCode', styleClass: 'code'},
    blockcode: {title:'Insert Block code', command: 'insertBlockCode', styleClass: 'insertBlockCode'},
    horizontalLine: {title:'Insert Horizontal Line', command: 'insertHorizontalLine', styleClass: 'horizontalLine'}
  };

  private _defaultButtonsList = ['list1', 'list2', 'bold', 'italic', 'link'];

  public setButtons(buttons: string[]): void {
    // if(!angular.isArray(buttons)) {
    //   throw 'Argument "buttons" should be an array';
    // }

    this._defaultButtonsList = buttons;
  };

  public addStandardButton(
    name: string,
    title: string,
    command: string,
    styleClass: string
  ) {

    if (!name || !title || !command) {
      throw 'Arguments "name", "title" and "command" are required';
    }

    styleClass = styleClass || '';
    this._buttonLibrary[name] = {title: title, command: command, styleClass: styleClass};
    this._defaultButtonsList.push(name);
  }

  public addCustomButton(name: string, pluginName: string): void {
    if (!name || !pluginName) {
      throw 'Arguments "name" and "pluginName" are required';
    }

    this._buttonLibrary[name] = {pluginName: pluginName, isComplex: true};
    this._defaultButtonsList.push(name);
  }

  public getToolbarButtons(buttonsList?: string): {}[] {
    let buttons = this._defaultButtonsList;
    const toolbarButtons: TButton[] = [];

    if (typeof buttonsList !== 'undefined') {
      buttons = string2array(buttonsList);
    }

    buttons.forEach(buttonKey => {
      if (!buttonKey) {
        return;
      }

      if (!this._buttonLibrary[buttonKey]) {
        throw 'There is no "' + buttonKey + '" in your library. Possible variants: ' + Object.keys(this._buttonLibrary);
      }

      let button = Object.assign({}, this._buttonLibrary[buttonKey]);
      // button.isActive = () => {return !!this.command && document.queryCommandState(this.command);}
      toolbarButtons.push(button);
    });

    return toolbarButtons;
  }

}

function string2array(keysString: string) {
  return keysString.split(',').map(Function.prototype.call, String.prototype.trim);
}