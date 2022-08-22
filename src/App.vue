<template>
	<div id="app">
        <div class="container">
            <h1>PDF calendars generator</h1>

            <div>
                <h3>Weekly planner</h3>
                <FormWeek/>
            </div>

            <hr>

            <div>
                <h3>Montly planner</h3>
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
