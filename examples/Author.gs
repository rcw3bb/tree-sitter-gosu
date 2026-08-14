package examples

uses java.lang.annotation.ElementType
uses java.lang.annotation.RetentionPolicy

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public annotation Author {
  function name() : String
  function email() : String = ""
  function priority() : int = 1
}
