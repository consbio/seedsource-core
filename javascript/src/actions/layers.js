export const UPDATE_VARIABLE_URLS = 'UPDATE_VARIABLE_URLS'

export const updateVariableUrls = (activeVariables, objective, climate, region) => {
    return {
        type: UPDATE_VARIABLE_URLS,
        activeVariables,
        objective,
        climate,
        region
    }
}