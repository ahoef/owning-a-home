// Import modules.
var _eventObserver = require( '../util/event-observer' );
var _domHelper = require( '../util/dom-helper' );

function create( options ) {
  return new InputGraded( options );
}

// InputGraded UI element constructor.
function InputGraded( options ) {
  // TODO see if bind() can be used in place of _self = this.
  // Note bind()'s lack of IE8 support.
  var _self = this;
  // Load our handlebar templates.
  var _template = require( '../../../templates/prepare-worksheets/input-graded.hbs' );
  var _grades = options.data.grades;
  
  this.row = options.row;
  
  var templateData = {
    placeholder: options.data.placeholder,
    grades: _grades,
    input: this.row
  }
  templateData['is_' + this.row.grade] = true;
  var _snippet = _template( templateData );
  
  // This appendChild could be replaced by jquery or similar if desired/needed.
  var _node = _domHelper.appendChild( options.container, _snippet );

  // DOM references.
  var _textInputDOM = _node.querySelector('.input-with-btns_input input');

  // Add events for handling deletion of the node.
  if ( this.row.deletable ) {
    var btnDeleteDOM = _node.querySelector('.btn-input-delete');
    btnDeleteDOM.addEventListener( 'mousedown', deleteItem, false );
  }

  // Deletes this graded input.
  function deleteItem( evt ) {
    _node.parentNode.removeChild( _node );
    _self.dispatchEvent( 'delete', {uid: _self.row.uid} );
  }

  var _module = require( './button-grading-group' );
  var _selector = '.input-with-btns_btns .btn';
  var buttonSettings = {
    container: _node, 
    selector: _selector, 
    row: this.row, 
    grades: _grades
  };
  var _buttonGradingGroup = _module.create( buttonSettings );

  // Listen for updates to the text or grading buttons.
  _textInputDOM.addEventListener( 'keyup', _changedHandler );
  _buttonGradingGroup.addEventListener( 'change', _changedHandler );
  
  function _changedHandler() {
      _self.dispatchEvent( 'change', {row: _self.row, data: getState()} );
  }
  // @return [Object] The contents of the text input and the button grade.
  function getState() {
    return {
      text: _textInputDOM.value,
      grade: _buttonGradingGroup.getGrade()
    };
  }

  // @param state [Object] `text` and `grade` values.
  function setState( state ) {
    var text = state.text === undefined ? '' : state.text;
    var grade = state.grade === undefined ? null : state.grade;
    _textInputDOM.value = text;
    _buttonGradingGroup.setGrade( grade );
  }

  // Expose instance's public methods.
  // 'deleteItem' is also included earlier.
  this.getState = getState;
  this.setState = setState;

  // Attach additional methods.
  _eventObserver.attach(this);
}

// Expose public methods.
this.create = create;