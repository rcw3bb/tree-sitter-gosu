package examples

uses java.util.List
uses java.util.ArrayList

/**
 * A sample Gosu class demonstrating common language constructs.
 */
class Sample {

  var _name: String
  var _items: List<String>

  construct(name: String) {
    _name = name
    _items = new ArrayList<String>()
  }

  property get Name(): String {
    return _name
  }

  property set Name(value: String) {
    _name = value
  }

  function addItem(item: String): void {
    _items.add(item)
  }

  function getItemCount(): int {
    return _items.size()
  }

  function greet(): String {
    return "Hello, ${_name}!"
  }

  static function create(name: String): Sample {
    return new Sample(name)
  }
}
