<script setup>
import { ref, defineEmits } from 'vue';

const emit = defineEmits(['remove']);
const isRemoved = ref(false);

function remove() {
    isRemoved.value = true;
    emit('remove');
}
</script>

<template>
    <button v-if="!isRemoved" class="box-list__box-remove" @click="remove">x</button>
</template>