package examples

uses gw.lang.reflect.Deprecated
uses gw.lang.reflect.gs.IGosuClass
uses java.lang.Override
uses java.lang.SuppressWarnings

/**
 * Demonstrates Gosu annotation usage on a class and its members.
 */
@SuppressWarnings("unused")
class Annotated {

  @Deprecated("Use fullName instead")
  var _legacyName: String

  var _firstName: String
  var _lastName: String

  construct(firstName: String, lastName: String) {
    _firstName = firstName
    _lastName = lastName
    _legacyName = firstName
  }

  @Deprecated("Use fullName property instead")
  function legacyGetName(): String {
    return _legacyName
  }

  @Override
  function toString(): String {
    return "${_firstName} ${_lastName}"
  }

  @SuppressWarnings({"unused", "deprecation"})
  static function fromLegacy(name: String): Annotated {
    var parts = name.split(" ")
    return new Annotated(parts[0], parts.length > 1 ? parts[1] : "")
  }

  property get fullName(): String {
    return "${_firstName} ${_lastName}"
  }
}
