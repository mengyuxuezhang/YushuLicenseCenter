<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
const props = defineProps<{ delivery: { text: string; expiresAt: number } }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement | null>(null), message = ref(''), area = ref<HTMLTextAreaElement | null>(null)
async function copy() {
  try { await navigator.clipboard.writeText(props.delivery.text); message.value = '已复制，交给代理商粘贴激活即可。' }
  catch { area.value?.focus(); area.value?.select(); message.value = '请按 Ctrl+C 复制已选中的完整接入信息。' }
}
onMounted(() => dialog.value?.showModal()); onUnmounted(() => dialog.value?.close())
</script>
<template>
  <dialog ref="dialog" class="grant-dialog" aria-label="授权接入信息" @cancel.prevent="emit('close')">
    <header class="dialog-heading"><div><h2>复制给代理商，一次粘贴激活</h2><p>代理商进入管理后台“授权与连接”，粘贴下方整段内容并点击“激活并应用”。</p></div><button type="button" class="secondary" @click="emit('close')">关闭</button></header>
    <label>授权接入信息<textarea ref="area" :value="delivery.text" rows="6" readonly spellcheck="false" autocomplete="off" /></label>
    <p>有效期至 {{ new Date(delivery.expiresAt).toLocaleString() }}。请仅交付给对应代理商；重新生成后，先前未使用的信息失效。</p>
    <button class="primary" @click="copy">复制接入信息</button><p v-if="message" role="status">{{ message }}</p>
  </dialog>
</template>
<style scoped>
dialog { width: min(640px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto; box-sizing: border-box; }
textarea { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; padding: 12px; color: var(--text); font: inherit; line-height: 1.6; background: #f8fafc; border: 1px solid var(--border); border-radius: 10px; overflow-wrap: anywhere; resize: vertical; }
textarea:focus { outline: 2px solid var(--brand); outline-offset: 2px; }
.dialog-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
.dialog-heading h2 { margin-top: 0; }
.dialog-heading button { flex-shrink: 0; }
@media (max-width: 480px) { .dialog-heading { flex-direction: column-reverse; gap: 12px; } .dialog-heading button { align-self: flex-end; } }
</style>
