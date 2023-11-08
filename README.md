# vue-composition-converter

https://github.com/fazulk/vue-composition-converter for Nuxt3 project

#### if you are getting a error (red border) it means your code could have some variable assignments that can't be converted. Such as below:

```
const varName = 'foo'
this.varName = varName
```

In this case you need to fix your code before attempting to convert.

## convert options into `script setup`

-   data, computed, watch, methods, lifecycle, props -> setup()
    -   data -> ref()
    -   computed -> computed()
    -   watch -> watch()
    -   methods -> function
    -   lifecycle -> lifecycle hooks
        -   beforeCreate, created -> Immediate function
    -   props -> toRefs()

## convert `this`

-   this.prop
    -   (toRefs, ref, computed) -> prop.value
    -   (other) -> prop
-   this.$globalProp -> ctx.root.$globalProp

Testing a link to [THE TOP](#convert-options-into-script-setup)
