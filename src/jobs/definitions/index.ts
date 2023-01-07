import mailDefinition from './mail'

const definitions = [mailDefinition]

const allDefinitions = (agenda: any) => {
    definitions.forEach((definition) => definition(agenda))
}

export default allDefinitions;