import computedOption from './../../../utils/computedOption'
import { computed, nextTick, ref, toRefs } from 'composition-api'

export default function useData(props, context, dependencies)
{
  const { schema, name } = toRefs(props)

  // ============ DEPENDENCIES =============

  const { form$ } = dependencies.form$
  const { available } = dependencies.conditions
  const { value, previousValue } = dependencies.value
  const { clean, resetValidators, validate } = dependencies.validation
  const { fireChange } = dependencies.events

  // ============== COMPUTED ===============

  const nill = computed(() => {
    return null
  })

  /**
   * A function that formats data before gets merged with form `data`.
   * 
   * @type {function}
   */
  const formatData = computed(computedOption('formatData', schema, (elName, value, form$) => {
    return { [elName]: value.value }
  }))

  /**
   * A function that formats data before [.load](#method-load) to the element.
   * 
   * @type {function}
   */
  const formatLoad = computed(computedOption('formatLoad', schema, (data, form$) => {
    return data
  }))

  /**
   * An object containing the element `name` as a key and its `value` as value.
   * 
   * @type {object}
   */
  const data = computed(() => {
    return formatData.value(name.value, value, form$)
  })
  
  /**
   * An object containing the element `name` as a key and its `value` as value only if the element is available and `submit` is not set to `false`.
   * 
   * @type {object}
   */
  const filtered = computed(() => {
    if (!available.value || !submit.value) {
      return {}
    }

    return data.value
  })

  /**
  * Whether the element's value should be submitted.
  * 
  * @type {boolean} 
  * @default true
  */
  const submit = computed(computedOption('submit', schema, true))

  /**
  * The default value of the element.
  * 
  * @type {boolean}
  */
  const default_ = computed(computedOption('default', schema, nill.value))

  // =============== METHODS ===============

  /**
   * Loads data for element or clears the element if the element's key is not found in the `data` object.  Sets `dirty` to `false`.
   *
   * @param {object} data an object containing data for the element using its **name as key**
   * @returns {void}
   */
  const load = (data) => {
    if (available && data && data[name.value] !== undefined) {
      update(formatLoad.value(data[name.value], form$))

      nextTick(() => {
        clean()
      })
      return
    }

    clear()
    resetValidators()
      
    nextTick(() => {
      clean()
    })
  }

  /**
   * Updates the element's value.
   *
   * @param {any} value the value to be set for the element
   * @param {boolean} triggerChange whether the element should trigger `change` event
   * @param {boolean} shouldValidate whether the element should be validated (default: `false`)
   * @returns {void}
   */
  const update = (val, triggerChange, shouldValidate) => {
    if (triggerChange === undefined) {
      triggerChange = false
    }

    if (shouldValidate === undefined) {
      shouldValidate = false
    }

    value.value = val

    if (triggerChange) {
      fireChange()
    }

    if (shouldValidate) {
     validate()
    }
  }

  /**
   * Resets the element to it's default state.
   *
   * @public
   * @returns {void}
   */
  const reset = () => {
    value.value = _.clone(default_.value)
    
    resetValidators()
  }

  /**
   * Clears the value of the element.
   *
   * @public
   * @returns {void}
   */
  const clear = () => {
    value.value = _.clone(nill.value)
  }

  /**
   * Prepares the element for submission.
   *
   * @public
   * @returns {void}
   */
  const prepare = async () => {}

  // =============== HOOKS ================

  previousValue.value = _.clone(nill.value)
  value.value = _.clone(default_.value)

  return {
    // Computed
    nill,
    data,
    filtered,
    formatData,
    formatLoad,
    submit,
    default: default_,

    // Mehtods
    load,
    update,
    clear,
    reset,
    prepare,
  }
}