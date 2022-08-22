<template>
	<div id="app">
        <div class="container">
            <h1>Generatore calendari PDF</h1>

            <div>
                <h3>Planner settimanale</h3>
                <FormWeek/>
            </div>

            <hr>

            <div>
                <h3>Planner mensile</h3>
                <FormMonth/>
            </div>
        </div>
	</div>
</template>

<script>

import FormWeek from "./components/FormWeek";
import FormMonth from "./components/FormMonth";

export default {
	name:       'App',
	components: {
        FormWeek,
        FormMonth
	}
}
</script>

<style>
</style>
