package examples

uses java.lang.annotation.ElementType
uses java.lang.annotation.RetentionPolicy

@Target({ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
annotation Since {
  function version() : String
  function deprecated() : boolean = false
}
