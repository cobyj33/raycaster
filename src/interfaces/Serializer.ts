export interface Serializer<Type, JSONType> {
    serialize(data: Type): JSONType;
    deserialize(data: JSONType): Type; 
}