<script setup>
import Box from './Box.vue';
import BoxVirtualElement from './BoxVirtualElement.vue';
import BoxVirtualSignal from './BoxVirtualSignal.vue';
import { useTemplateRef } from 'vue';

const relativeB = useTemplateRef('relativeB');
const relativeC = useTemplateRef('relativeC');
const win = window;
</script>

<template>
    <ul class="box-list">
        <Box class="box-list__box-sticky" :relative="win" />
        <Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box /><Box />
        <BoxVirtualElement class="box-list__box-virtual" />
        <BoxVirtualSignal class="box-list__box-virtual-signal" />
        <li class="box-list__box box-list__box-virtual-box-preview"></li>
        <li></li><li></li>
        <Box class="box-list__box box-list__box-relative" :relative="relativeB" />
        <Box class="box-list__box-line">
            <Box ref="relativeB" class="box-list__box box-list__box-relative" :relative="relativeC" />
            <Box ref="relativeC" class="box-list__box box-list__box-relative" :relative="false" />
        </Box>
        <li></li><li></li><li></li><li></li><li></li><li></li>
        <Box /><Box /><Box /><Box />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
        <Box /><Box /><Box /><Box class="box-list__box-viewport" :relative="win" /><Box class="box-list__box-viewport" :relative="win" />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
        <Box /><Box /><Box /><Box />
        <li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li>
    </ul>
</template>

<style scoped>

</style>