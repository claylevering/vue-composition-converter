<script lang="ts" setup>
import { onUpdated, ref, watch } from 'vue'
import prettier from 'prettier'
import parserTypeScript from 'prettier/parser-typescript'
import hljs from 'highlight.js/lib/core'
import typescript from 'highlight.js/lib/languages/typescript'
import 'highlight.js/styles/atom-one-dark.css'
import { convertSrc } from '../lib/converter'
import optionsApi from '../assets/template/optionsAPI.txt?raw'

hljs.registerLanguage('typescript', typescript)

const templateMap = new Map([['optionsAPI', optionsApi]])

const input = ref('')
const output = ref('')
const hasError = ref(false)
const templateKeys = Array.from(templateMap.keys())
const error = ref<Error>()

const selectedTemplate = ref(templateKeys[0])
watch(
  selectedTemplate,
  async () => {
    hasError.value = false
    try {
      input.value = templateMap.get(selectedTemplate.value) || ''
    } catch (err) {
      hasError.value = true
      console.error(err)
    }
  },
  { immediate: true }
)

watch(
  input,
  () => {
    try {
      hasError.value = false
      const outputText = convertSrc(input.value)
      const prettifiedHtml = hljs.highlightAuto(
        prettier.format(outputText, {
          parser: 'typescript',
          plugins: [parserTypeScript],
        })
      ).value
      output.value = prettifiedHtml
    } catch (err) {
      hasError.value = true
      error.value = err as Error
      console.error(err)
      setTimeout(() => {
        scrollTo(0, 0)
      }, 20)
      output.value = ''
    }
  },
  { immediate: true }
)
onUpdated(() => {
  scrollTo(0, 0)
})
</script>

<template>
  <div class="h-48">
    <div v-if="hasError" class="hasError p-4 m-6">
      <h2>Error:</h2>
      <p>consoleで詳細なエラーを確認してください。</p>
      <p>コンバータが対応できない記法がある場合、適宜その箇所をコメントアウトして後ほど手で書き直してください。</p>
      <p>{{ error }}</p>
    </div>
  </div>
  <div class="flex flex-row h-full">
    <div class="flex-1 flex flex-col w-1/2">
      <div class="flex flex-row h-12">
        <h2>Input: Options API</h2>
        <p></p>
      </div>
      <textarea
        class="border w-full text-xs leading-3 flex-1 p-2"
        :class="{ hasError }"
        v-model="input"
      ></textarea>
    </div>
    <div class="flex-1 flex flex-col w-1/2 h-12">
      <h2>Output: ※ script setup の中身のみを出力。</h2>
      <p>ペースト後、scriptタグをsetupに書き換えてください</p>
      <pre
        class="hljs border w-full text-xs leading-3 flex-1 p-2 whitespace-pre-wrap select-all"
        v-html="output"
      />
    </div>
  </div>
</template>

<style scoped>
.hasError {
  @apply border-4 border-red-500 outline-none;
}
</style>
