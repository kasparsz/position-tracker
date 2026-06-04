<script setup>
import Box from './Box.vue';
import BoxVirtualElement from './BoxVirtualElement.vue';
import BoxVirtualSignal from './BoxVirtualSignal.vue';
import { computed, useTemplateRef } from 'vue';

const relativeComponentB = useTemplateRef('relativeB');
const relativeElementB = computed(() => relativeComponentB.value?.element);
const relativeComponentC = useTemplateRef('relativeC');
const relativeElementC = computed(() => relativeComponentC.value?.element)
const doc = document;
const win = window;
</script>

<template>
    <ul class="box-list">
        <Box class="box-list__box-sticky" :relative="win" />
        <Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" />
        <BoxVirtualElement class="box-list__box-virtual" />
        <BoxVirtualSignal class="box-list__box-virtual-signal" />
        <li class="box-list__box box-list__box-virtual-box-preview"></li>
        <li></li><li></li>
        <Box class="box-list__box box-list__box-relative" :relative="relativeElementB" />
        <Box class="box-list__box-line">
            <Box ref="relativeB" class="box-list__box box-list__box-relative" :relative="relativeElementC" />
            <Box ref="relativeC" class="box-list__box box-list__box-relative" :disabled="true" />
        </Box>
        <li></li><li></li><li></li><li></li><li></li><li></li>
        <Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
        <Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box class="box-list__box-viewport" :relative="win" /><Box class="box-list__box-viewport" :relative="win" />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
        <Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" /><Box :relative="doc" />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
</template>

<style scoped>

</style>