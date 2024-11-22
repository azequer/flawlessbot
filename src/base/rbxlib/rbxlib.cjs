//everything taken from BTRoblox

var objConverterPath = "obj2rbxmesh";

const execSync = require('child_process').execSync;

function assert(bool, reason) {
if (!bool) {
console.log("ASSERTION FAILED: "+reason);
process.exit(1);
}
}

class ByteReader extends Uint8Array {
	static ParseFloat(long) {
		const exp = (long >>> 23) & 255
		if(exp === 0) { return 0 }
		const float = 2 ** (exp - 127) * (1 + (long & 0x7FFFFF) / 0x7FFFFF)
		return long > 0x7FFFFFFF ? -float : float
	}

	static ParseRBXFloat(long) {
		const exp = long >>> 24
		if(exp === 0) { return 0 }
		const float = 2 ** (exp - 127) * (1 + ((long >>> 1) & 0x7FFFFF) / 0x7FFFFF)
		return long & 1 ? -float : float
	}

	static ParseDouble(long0, long1) {
		const exp = (long0 >>> 20) & 0x7FF
		const frac = (((long0 & 1048575) * 4294967296) + long1) / 4503599627370496
		const neg = long0 & 2147483648

		if(exp === 0) {
			if(frac === 0) { return -0 }
			const double = 2 ** (exp - 1023) * frac
			return neg ? -double : double
		} else if(exp === 2047) {
			return frac === 0 ? Infinity : NaN
		}

		const double = 2 ** (exp - 1023) * (1 + frac)
		return neg ? -double : double
	}

	constructor(...args) {
		if(args[0] instanceof Uint8Array) {
			args[1] = args[0].byteOffset
			args[2] = args[0].byteLength
			args[0] = args[0].buffer
		}
		
		assert(args[0] instanceof ArrayBuffer, "buffer is not an ArrayBuffer")
		super(...args)

		this.index = 0
	}

	SetIndex(n) { this.index = n }
	GetIndex() { return this.index }
	GetRemaining() { return this.length - this.index }
	GetLength() { return this.length }
	Jump(n) { this.index += n }

	Array(n) {
		const result = new Uint8Array(this.buffer, this.index, n)
		this.index += n
		return result
	}

	Match(arr) {
		const begin = this.index
		this.index += arr.length
		for(let i = 0; i < arr.length; i++) {
			if(arr[i] !== this[begin + i]) { return false }
		}
		return true
	}

	Byte() { return this[this.index++] }
	UInt8() { return this[this.index++] }
	UInt16LE() { return this[this.index++] + (this[this.index++] * 256) }
	UInt16BE() { return (this[this.index++] * 256) + this[this.index++] }
	UInt32LE() { return this[this.index++] + (this[this.index++] * 256) + (this[this.index++] * 65536) + (this[this.index++] * 16777216) }
	UInt32BE() { return (this[this.index++] * 16777216) + (this[this.index++] * 65536) + (this[this.index++] * 256) + this[this.index++] }

	Int8() { return (this[this.index++]) << 24 >> 24 }
	Int16LE() { return (this[this.index++] + (this[this.index++] * 256)) << 16 >> 16 }
	Int16BE() { return ((this[this.index++] * 256) + this[this.index++]) << 16 >> 16 }
	Int32LE() { return (this[this.index++] + (this[this.index++] * 256) + (this[this.index++] * 65536) + (this[this.index++] * 16777216)) >> 0 }
	Int32BE() { return ((this[this.index++] * 16777216) + (this[this.index++] * 65536) + (this[this.index++] * 256) + this[this.index++]) >> 0 }

	FloatLE() { return ByteReader.ParseFloat(this.UInt32LE()) }
	FloatBE() { return ByteReader.ParseFloat(this.UInt32BE()) }
	DoubleLE() {
		const byte = this.UInt32LE()
		return ByteReader.ParseDouble(this.UInt32LE(), byte)
	}
	DoubleBE() { return ByteReader.ParseDouble(this.UInt32BE(), this.UInt32BE()) }

	String(n) {
                let utf8decoder = new TextDecoder();
		return utf8decoder.decode(this.Array(n));
	}

	// Custom stuff
	LZ4(buffer) {
		const comLength = this.UInt32LE()
		const decomLength = this.UInt32LE()
		this.Jump(4)

		if(comLength === 0) { // TOOD: This path is actually not supported by Roblox, may have to take a look at some point?
			assert(this.GetRemaining() >= decomLength, "[ByteReader.LZ4] unexpected eof")
			return this.Array(decomLength)
		}
		
		assert(this.GetRemaining() >= comLength, "[ByteReader.LZ4] unexpected eof")
		
		if(!buffer || buffer.length < decomLength) {
			buffer = new Uint8Array(decomLength)
		}

		const start = this.index
		const end = start + comLength
		const data = buffer.length === decomLength ? buffer : buffer.subarray(0, decomLength)
		let index = 0

		while(this.index < end) {
			const token = this.Byte()
			let litLen = token >>> 4

			if(litLen === 0xF) {
				while(true) {
					const lenByte = this.Byte()
					litLen += lenByte
					if(lenByte !== 0xFF) { break }
				}
			}
			
			assert(this.index + litLen <= end, "[ByteReader.LZ4] unexpected eof")

			for(let i = 0; i < litLen; i++) {
				data[index++] = this.Byte()
			}

			if(this.index < end) {
				const offset = this.UInt16LE()
				const begin = index - offset
				
				let len = token & 0xF

				if(len === 0xF) {
					while(true) {
						const lenByte = this.Byte()
						len += lenByte
						if(lenByte !== 0xFF) { break }
					}
				}

				len += 4
				
				for(let i = 0; i < len; i++) {
					data[index++] = data[begin + i]
				}
			}
		}

		assert(this.index === end, "[ByteReader.LZ4] input size mismatch")
		assert(index === decomLength, "[ByteReader.LZ4] output size mismatch")
		
		return data
	}

	// RBX

	RBXFloatLE() { return ByteReader.ParseRBXFloat(this.UInt32LE()) }
	RBXFloatBE() { return ByteReader.ParseRBXFloat(this.UInt32BE()) }
	
	RBXInterleavedUint32(count, result) {
		for(let i = 0; i < count; i++) {
			result[i] = (this[this.index + i] << 24)
				+ (this[this.index + i + count] << 16)
				+ (this[this.index + i + count * 2] << 8)
				+ (this[this.index + i + count * 3])
		}

		this.Jump(count * 4)
		return result
	}

	RBXInterleavedInt32(count, result) {
		this.RBXInterleavedUint32(count, result)
		
		for(let i = 0; i < count; i++) {
			result[i] = (result[i] % 2 === 1 ? -(result[i] + 1) / 2 : result[i] / 2)
		}
		
		return result
	}

	RBXInterleavedFloat(count, result) {
		this.RBXInterleavedUint32(count, result)
		
		for(let i = 0; i < count; i++) {
			result[i] = ByteReader.ParseRBXFloat(result[i])
		}
		
		return result
	}
}

{
	const peekMethods = [
		"Byte", "UInt8", "UInt16LE", "UInt16BE", "UInt32LE", "UInt32BE",
		"FloatLE", "FloatBE", "DoubleLE", "DoubleBE", "String"
	]
	
	for(const key of peekMethods) {
		const fn = ByteReader.prototype[key]
		
		ByteReader.prototype["Peek" + key] = function(...args) {
			const index = this.GetIndex()
			const result = fn.apply(this, args)
			this.SetIndex(index)
			return result
		}
	}
}

const RBXInstanceUtils = {
	findFirstChild(target, name, recursive = false) {
		const children = target instanceof RBXInstance ? target.Children : target
		
		for(const child of children) {
			if(child.getProperty("Name") === name) {
				return child
			}
		}
		
		if(recursive) {
			const arrays = [children]
			
			while(arrays.length) {
				for(const desc of arrays.shift()) {
					if(desc.getProperty("Name") === name) {
						return desc
					}
					
					if(desc.Children.length) {
						arrays.push(desc.Children)
					}
				}
			}
		}
		
		return null
	},
	
	findFirstChildOfClass(target, className, recursive = false) {
		const children = target instanceof RBXInstance ? target.Children : target
		
		for(const child of children) {
			if(child.getProperty("ClassName") === className) {
				return child
			}
		}
		
		if(recursive) {
			const arrays = [children]
			
			while(arrays.length) {
				for(const desc of arrays.shift()) {
					if(desc.getProperty("ClassName") === className) {
						return desc
					}
					
					if(desc.Children.length) {
						arrays.push(desc.Children)
					}
				}
			}
		}
		
		return null
	}
}

class RBXInstanceRoot extends Array {
	findFirstChild(...args) { return RBXInstanceUtils.findFirstChild(this, ...args) }
	findFirstChildOfClass(...args) { return RBXInstanceUtils.findFirstChildOfClass(this, ...args) }
}

class RBXInstance {
	static new(className) {
		assert(typeof className === "string", "className is not a string")
		return new RBXInstance(className)
	}

	constructor(className) {
		assert(typeof className === "string", "className is not a string")
		
		this.Children = []
		this.Properties = {}

		this.setProperty("ClassName", className, "string")
		this.setProperty("Name", "Instance", "string")
		this.setProperty("Parent", null, "Instance")
	}

	setProperty(name, value, type) {
		if(!type) {
			if(typeof value === "boolean") {
				type = "bool"
			} else if(value instanceof RBXInstance) {
				type = "Instance"
			} else {
				throw new TypeError("You need to specify property type")
			}
		}

		let descriptor = this.Properties[name]
		if(descriptor) {
			assert(descriptor.type === type, `Property type mismatch ${type} !== ${descriptor.type}`)

			if(name === "Parent" && descriptor.value instanceof RBXInstance) {
				const index = descriptor.value.Children.indexOf(this)
				if(index !== -1) {
					descriptor.value.Children.splice(index, 1)
				}
			}

			descriptor.value = value
		} else {
			descriptor = this.Properties[name] = { type, value }
		}

		if(name === "Parent") {
			if(descriptor.value instanceof RBXInstance) {
				descriptor.value.Children.push(this)
			}
		}

		if(name !== "Children" && name !== "Properties" && !(name in Object.getPrototypeOf(this))) {
			this[name] = value
		}
	}
	
	getProperty(name, caseInsensitive = false) {
		const descriptor = this.Properties[name] || caseInsensitive && Object.entries(this.Properties).find(x => x[0].toLowerCase() === name.toLowerCase())?.[1]
		return descriptor ? descriptor.value : undefined
	}

	hasProperty(name, caseInsensitive = false) {
		return name in this.Properties || caseInsensitive && !Object.entries(this.Properties).find(x => x[0].toLowerCase() === name.toLowerCase())
	}
	
	findFirstChild(...args) { return RBXInstanceUtils.findFirstChild(this, ...args) }
	findFirstChildOfClass(...args) { return RBXInstanceUtils.findFirstChildOfClass(this, ...args) }
}

const jsdom = require("jsdom");

const RBXXmlParser = {
	Transforms: {
		CFrame: ["X", "Y", "Z", "R00", "R01", "R02", "R10", "R11", "R12", "R20", "R21", "R22"],
		Vector3: ["X", "Y", "Z"],
		Vector2: ["X", "Y"]
	},
	
	escapeXml(value) {
		return value
			.replace(/&amp;/g, "&amp;&amp;")
			.replace(/&#((?!0?0?38;)\d{1,4}|(?!0?0?26;)x[0-9a-fA-F]{1,4});/g, "&amp;#$1;")
	},
	
	unescapeXml(value) {
		if(value.startsWith("<![CDATA[")) {
			// https://github.com/niklasvh/base64-arraybuffer/blob/master/src/index.ts
			
			const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
			const lookup = new Uint8Array(256)
			
			for (let i = 0; i < chars.length; i++) {
				lookup[chars.charCodeAt(i)] = i
			}
			
			const decodeBase64 = (base64, startIndex, endIndex) => {
				let bufferLength = base64.length * 0.75
				let len = endIndex - startIndex
				let i = startIndex
				let p = 0
				let encoded1
				let encoded2
				let encoded3
				let encoded4

				if (base64[base64.length - 1] === "=") {
					bufferLength--
					if (base64[base64.length - 2] === "=") {
						bufferLength--
					}
				}

				const bytes = new Uint8Array(bufferLength)

				for (; i < len; i += 4) {
					encoded1 = lookup[base64.charCodeAt(i)]
					encoded2 = lookup[base64.charCodeAt(i + 1)]
					encoded3 = lookup[base64.charCodeAt(i + 2)]
					encoded4 = lookup[base64.charCodeAt(i + 3)]

					bytes[p++] = (encoded1 << 2) | (encoded2 >> 4)
					bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2)
					bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63)
				}

				return bytes
			}
			
			return bufferToString(decodeBase64(value, 9, -3))
		}
		
		return value
			.replace(/(?<!&)((?:&{2})*)&#(\d{1,4}|x[0-9a-fA-F]{1,4});/g, (_, prefix, inner) => {
				const byte = inner[0] === "x" ? parseInt(inner.slice(1), 16) : parseInt(inner, 10)
				return `${prefix}${String.fromCharCode(byte)}`
			})
			.replace(/&&/g, "&")
	},

	parse(buffer, params) {
		let utf8decoder = new TextDecoder();
		const xml = new jsdom.JSDOM(this.escapeXml(utf8decoder.decode(buffer))).window.document

		const parser = {
			type: 0,
			result: new RBXInstanceRoot(),
			refs: {},
			refWait: [],
			sharedStrings: {}
		}

		const sharedStrings = xml.querySelector(":scope > SharedStrings")
		if(sharedStrings) {
			for(const child of Object.values(sharedStrings.children)) {
				if(child.nodeName !== "SharedString") { continue }
				const md5 = child.getAttribute("md5")
				let value

				try { value = window.atob(child.textContent.trim()) }
				catch(ex) { console.error(ex) }

				if(typeof md5 === "string" && typeof value === "string") {
					parser.sharedStrings[md5] = { md5, value }
				}
			}
		}

		for(const child of Object.values(xml.children)) {
			if(child.nodeName === "Item") {
				parser.result.push(this.parseItem(parser, child))
			}
		}

		if(params?.async) {
			parser.asyncPromise = Promise.resolve(parser.result)
		}
		
		return parser
	},

	parseItem(parser, node) {
		const inst = RBXInstance.new(node.className)
		const referent = node.getAttribute("referent")

		if(referent) {
			parser.refs[referent] = inst
			
			for(const wait of parser.refWait) {
				if(wait.id === referent) {
					parser.refWait.splice(parser.refWait.indexOf(wait), 1)
					wait.inst.setProperty(wait.name, inst, "Instance")
				}
			}
		}

		for(const childNode of Object.values(node.children)) {
			switch(childNode.nodeName) {
			case "Item": {
				const child = this.parseItem(parser, childNode)
				child.setProperty("Parent", inst)
				break
			}
			case "Properties":
				this.parseProperties(parser, inst, childNode)
				break
			}
		}

		return inst
	},

	parseProperties(parser, inst, targetNode) {
		for(const propNode of Object.values(targetNode.children)) {
			const name = propNode.attributes.name.value
			const value = propNode.textContent

			switch(propNode.nodeName.toLowerCase()) {
			case "content":
			case "string":
			case "protectedstring":
			case "binarystring": {
				inst.setProperty(name, this.unescapeXml(value.trim()), "string")
				break
			}
			case "double": {
				inst.setProperty(name, +value, "double")
				break
			}
			case "float": {
				inst.setProperty(name, +value, "float")
				break
			}
			case "int": {
				inst.setProperty(name, +value, "int")
				break
			}
			case "int64": {
				inst.setProperty(name, value, "int64")
				break
			}
			case "bool": {
				inst.setProperty(name, value.toLowerCase() === "true", "bool")
				break
			}
			case "token": {
				inst.setProperty(name, +value, "Enum")
				break
			}
			case "color3":
			case "color3uint8": {
				inst.setProperty(name, [(+value >>> 16 & 255) / 255, (+value >>> 8 & 255) / 255, (+value & 255) / 255], "Color3")
				break
			}
			case "optionalcoordinateframe":
				const cframeNode = Object.values(propNode.children).find(x => x.nodeName.toLowerCase() === "cframe")
				if(!cframeNode) { break }
				
				propNode = cframeNode
				// break omitted
			case "coordinateframe": {
				const cframe = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
				
				for(const x of Object.values(propNode.children)) {
					const index = this.Transforms.CFrame.indexOf(x.nodeName.toUpperCase())
					if(index !== -1) {
						cframe[index] = +x.textContent
					}
				}

				inst.setProperty(name, cframe, "CFrame")
				break
			}
			case "vector2": {
				const vector2 = [0, 0]
				
				for(const x of Object.values(propNode.children)) {
					const index = this.Transforms.Vector2.indexOf(x.nodeName.toUpperCase())
					if(index !== -1) {
						vector2[index] = +x.textContent
					}
				}

				inst.setProperty(name, vector2, "Vector2")
				break
			}
			case "vector3": {
				const vector3 = [0, 0, 0]
				
				for(const x of Object.values(propNode.children)) {
					const index = this.Transforms.Vector3.indexOf(x.nodeName.toUpperCase())
					if(index !== -1) {
						vector3[index] = +x.textContent
					}
				}

				inst.setProperty(name, vector3, "Vector3")
				break
			}
			case "udim2": {
				const udim2 = [
					[0, 0],
					[0, 0]
				]

				for(const x of Object.values(propNode.children)) {
					const nodeName = x.nodeName.toUpperCase()

					if(nodeName === "XS") { udim2[0][0] = +x.textContent }
					else if(nodeName === "XO") { udim2[0][1] = +x.textContent }
					else if(nodeName === "YS") { udim2[1][0] = +x.textContent }
					else if(nodeName === "YO") { udim2[0][1] = +x.textContent }
				}

				inst.setProperty(name, udim2, "UDim2")
				break
			}
			case "physicalproperties": {
				const props = { CustomPhysics: false, Density: null, Friction: null, Elasticity: null, FrictionWeight: null, ElasticityWeight: null }
				
				for(const x of Object.values(propNode.children)) {
					if(x.nodeName in props) {
						props[x.nodeName] = x.nodeName === "CustomPhysics" ? x.textContent.toLowerCase() === "true" : +x.textContent
					}
				}

				inst.setProperty(name, props, "PhysicalProperties")
				break
			}
			case "ref": {
				const target = parser.refs[value] || null
				
				if(!target && value.toLowerCase() !== "null") {
					parser.refWait.push({
						inst, name,
						id: value
					})
				}

				inst.setProperty(name, target, "Instance")
				break
			}
			case "sharedstring": {
				const md5 = value.trim()
				const sharedString = parser.sharedStrings[md5].value

				inst.setProperty(name, sharedString, "SharedString")
				break
			}
			case "uniqueid": {
				inst.setProperty(name, value.trim(), "UniqueId")
				break
			}
			case "colorsequence":
			case "numberrange":
			case "numbersequence":
				break
			default:
				THROW_DEV_WARNING(`[ParseRBXXml] Unknown dataType ${propNode.nodeName} for ${inst.ClassName}.${name}`, propNode.innerHTML)
			}
		}
	}
}

const RBXBinaryParser = {
	HeaderBytes: [0x3C, 0x72, 0x6F, 0x62, 0x6C, 0x6F, 0x78, 0x21, 0x89, 0xFF, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00],
	Faces: [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]],
	DataTypes: [
		null, "string", "bool", "int", "float", "double", "UDim", "UDim2", // 7
		"Ray", "Faces", "Axes", "BrickColor", "Color3", "Vector2", "Vector3", "Vector2int16", // 15
		"CFrame", "Quaternion", "Enum", "Instance", "Vector3int16", "NumberSequence", "ColorSequence", // 22
		"NumberRange", "Rect2D", "PhysicalProperties", "Color3uint8", "int64", "SharedString", "UnknownScriptFormat", // 29
		"Optional", "UniqueId"
	],

	parse(buffer, params) {
		const reader = new ByteReader(buffer)
                const parser = {
			type: 1,

                        result: new RBXInstanceRoot(),
                        reader: reader,

                        instances: new Array(),
                        groups: new Array(),

                        sharedStrings: [],
                        meta: {},

                        arrays: [],
                        arrayIndex: 0,
                }

		if(!reader.Match(this.HeaderBytes)) {
			console.log("Header mismatch: Trying XML");
			var xxml = RBXXmlParser.parse(buffer);
			return xxml;
		}

		const groupsCount = reader.UInt32LE()
		const instancesCount = reader.UInt32LE()
		parser.instances = new Array(instancesCount);
		parser.groups = new Array(groupsCount);
		reader.Jump(8)
		
		parser.result.meta = parser.meta
		
		for(let i = 0; i < 6; i++) {
			parser.arrays.push(new Array(256))
		}
		
		const startIndex = reader.GetIndex()
		let maxChunkSize = 0
		
		const chunkIndices = []
		
		while(reader.GetRemaining() >= 4) {
			chunkIndices.push(reader.GetIndex())
			
			const chunkType = reader.String(4)
			const comLength = reader.UInt32LE()
			const decomLength = reader.UInt32LE()
			
			if(comLength > 0) {
				reader.Jump(4 + comLength)
				
				if(decomLength > maxChunkSize) {
					maxChunkSize = decomLength
				}
			} else {
				reader.Jump(4 + decomLength)
			}
		}
		
		reader.chunkBuffer = new Uint8Array(maxChunkSize)
		
		if(reader.GetRemaining() > 0) {
			THROW_DEV_WARNING("[ParseRBXBin] Unexpected data after END")
		}
		for(const startIndex of chunkIndices) {
			this.parseChunk(parser, startIndex)
			console.log("Parsed chunk "+startIndex+" of "+chunkIndices.length);
		}
		
		
		
		return parser
	},
	
	parseChunk(parser, startIndex) {
		parser.reader.SetIndex(startIndex)
		
		const chunkType = parser.reader.String(4)
		if(chunkType === "END\0") { return }
		
		const chunkData = parser.reader.LZ4(parser.chunkBuffer)
		const chunkReader = new ByteReader(chunkData)
		
		parser.arrayIndex = 0

		switch(chunkType) {
		case "INST":
			this.parseINST(parser, chunkReader)
			break
		case "PROP":
			this.parsePROP(parser, chunkReader)
			break
		case "PRNT":
			this.parsePRNT(parser, chunkReader)
			break
		case "SSTR":
			this.parseSSTR(parser, chunkReader)
			break
		case "META":
			this.parseMETA(parser, chunkReader)
			break
		case "SIGN":
			break

		default:
			THROW_DEV_WARNING(`[ParseRBXBin] Unknown chunk '${chunkType}'`)
		}
	},

	parseMETA(parser, chunk) {
		const numEntries = chunk.UInt32LE()

		for(let i = 0; i < numEntries; i++) {
			const key = chunk.String(chunk.UInt32LE())
			const value = chunk.String(chunk.UInt32LE())
			parser.meta[key] = value
		}
	},
	
	parseSSTR(parser, chunk) {
		chunk.UInt32LE() // version
		const stringCount = chunk.UInt32LE()

		for(let i = 0; i < stringCount; i++) {
			const md5 = chunk.Array(16)
			const length = chunk.UInt32LE()
			const value = chunk.String(length)

			parser.sharedStrings[i] = { md5, value }
		}
	},

	parseINST(parser, chunk) {
		const groupId = chunk.UInt32LE()
		const className = chunk.String(chunk.UInt32LE())
		chunk.Byte() // isService
		const instCount = chunk.UInt32LE()
		const instIds = chunk.RBXInterleavedInt32(instCount, parser.arrays[parser.arrayIndex++])

		const group = parser.groups[groupId] = {
			ClassName: className,
			Objects: []
		}

		let instId = 0
		for(let i = 0; i < instCount; i++) {
			instId += instIds[i]
			group.Objects.push(parser.instances[instId] = RBXInstance.new(className))
		}
	},

	parsePROP(parser, chunk) {
		const group = parser.groups[chunk.UInt32LE()]
		const prop = chunk.String(chunk.UInt32LE())

		if(chunk.GetRemaining() <= 0) {
			return // empty chunk?
		}

		const instCount = group.Objects.length
		const values = parser.arrays[parser.arrayIndex++]
		
		let dataType = chunk.Byte()
		let typeName = this.DataTypes[dataType]
		
		let isOptional = typeName === "Optional"
		
		if(isOptional) {
			dataType = chunk.Byte()
			typeName = this.DataTypes[dataType]
		}
		
		let resultTypeName = typeName || "Unknown"

		switch(typeName) {
		case "string":
			for(let i = 0; i < instCount; i++) {
				const len = chunk.UInt32LE()
				values[i] = chunk.String(len)
				console.log("String at "+i+": "+values[i]);
			}
			break
		case "bool":
			for(let i = 0; i < instCount; i++) {
				values[i] = chunk.Byte() !== 0
			}
			break
		case "int":
			chunk.RBXInterleavedInt32(instCount, values)
			break
		case "float":
			chunk.RBXInterleavedFloat(instCount, values)
			break
		case "double":
			for(let i = 0; i < instCount; i++) {
				values[i] = chunk.DoubleLE()
			}
			break
		case "UDim": {
			const scale = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const offset = chunk.RBXInterleavedInt32(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i] = [scale[i], offset[i]]
			}
			break
		}
		case "UDim2": {
			const scaleX = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const scaleY = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const offsetX = chunk.RBXInterleavedInt32(instCount, parser.arrays[parser.arrayIndex++])
			const offsetY = chunk.RBXInterleavedInt32(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i] = [
					[scaleX[i], offsetX[i]],
					[scaleY[i], offsetY[i]]
				]
			}
			break
		}
		case "Ray": {
			for(let i = 0; i < instCount; i++) {
				values[i] = [
					[chunk.RBXFloatLE(), chunk.RBXFloatLE(), chunk.RBXFloatLE()],
					[chunk.RBXFloatLE(), chunk.RBXFloatLE(), chunk.RBXFloatLE()]
				]
			}
			break
		}
		case "Faces":
			for(let i = 0; i < instCount; i++) {
				const data = chunk.Byte()

				values[i] = {
					Right: !!(data & 1),
					Top: !!(data & 2),
					Back: !!(data & 4),
					Left: !!(data & 8),
					Bottom: !!(data & 16),
					Front: !!(data & 32)
				}
			}
			break
		case "Axes":
			for(let i = 0; i < instCount; i++) {
				const data = chunk.Byte()
				values[i] = {
					X: !!(data & 1),
					Y: !!(data & 2),
					Z: !!(data & 4)
				}
			}
			break
		case "BrickColor":
			chunk.RBXInterleavedUint32(instCount, values)
			break
		case "Color3": {
			const red = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const green = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const blue = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i] = [red[i], green[i], blue[i]]
			}
			break
		}
		case "Vector2": {
			const vecX = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const vecY = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i] = [vecX[i], vecY[i]]
			}
			break
		}
		case "Vector3": {
			const vecX = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const vecY = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const vecZ = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i] = [vecX[i], vecY[i], vecZ[i]]
			}
			break
		}
		case "Vector2int16": break // Not used anywhere?
		case "CFrame": {
			for(let vi = 0; vi < instCount; vi++) {
				const value = values[vi] = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]
				const type = chunk.Byte()

				if(type !== 0) {
					const right = this.Faces[Math.floor((type - 1) / 6)]
					const up = this.Faces[Math.floor(type - 1) % 6]
					const back = [
						right[1] * up[2] - up[1] * right[2],
						right[2] * up[0] - up[2] * right[0],
						right[0] * up[1] - up[0] * right[1]
					]

					for(let i = 0; i < 3; i++) {
						value[3 + i * 3] = right[i]
						value[4 + i * 3] = up[i]
						value[5 + i * 3] = back[i]
					}
				} else {
					for(let i = 0; i < 9; i++) {
						value[i + 3] = chunk.FloatLE()
					}
				}
			}

			const vecX = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const vecY = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const vecZ = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			for(let i = 0; i < instCount; i++) {
				values[i][0] = vecX[i]
				values[i][1] = vecY[i]
				values[i][2] = vecZ[i]
			}
			break
		}
		case "Quaternion": break // Not used anywhere?
		case "Enum":
			chunk.RBXInterleavedUint32(instCount, values)
			break
		case "Instance": {
			const refIds = chunk.RBXInterleavedInt32(instCount, parser.arrays[parser.arrayIndex++])

			let refId = 0
			for(let i = 0; i < instCount; i++) {
				refId += refIds[i]
				values[i] = parser.instances[refId]
			}
			break
		}
		case "Vector3int16":
			break // Not used anywhere?
		case "NumberSequence": {
			for(let i = 0; i < instCount; i++) {
				const seqLength = chunk.UInt32LE()
				const seq = values[i] = []

				for(let j = 0; j < seqLength; j++) {
					seq.push({
						Time: chunk.FloatLE(),
						Value: chunk.FloatLE(),
						Envelope: chunk.FloatLE()
					})
				}
			}
			break
		}
		case "ColorSequence":
			for(let i = 0; i < instCount; i++) {
				const seqLength = chunk.UInt32LE()
				const seq = values[i] = []

				for(let j = 0; j < seqLength; j++) {
					seq.push({
						Time: chunk.FloatLE(),
						Color: [chunk.FloatLE(), chunk.FloatLE(), chunk.FloatLE()],
						EnvelopeMaybe: chunk.FloatLE()
					})
				}
			}
			break
		case "NumberRange":
			for(let i = 0; i < instCount; i++) {
				values[i] = {
					Min: chunk.FloatLE(),
					Max: chunk.FloatLE()
				}
			}
			break
		case "Rect2D": {
			const x0 = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const y0 = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const x1 = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])
			const y1 = chunk.RBXInterleavedFloat(instCount, parser.arrays[parser.arrayIndex++])

			for(let i = 0; i < instCount; i++) {
				values[i] = [x0[i], y0[i], x1[i], y1[i]]
			}
			break
		}
		case "PhysicalProperties":
			for(let i = 0; i < instCount; i++) {
				const enabled = chunk.Byte() !== 0
				values[i] = {
					CustomPhysics: enabled,
					Density: enabled ? chunk.RBXFloatLE() : null,
					Friction: enabled ? chunk.RBXFloatLE() : null,
					Elasticity: enabled ? chunk.RBXFloatLE() : null,
					FrictionWeight: enabled ? chunk.RBXFloatLE() : null,
					ElasticityWeight: enabled ? chunk.RBXFloatLE() : null
				}
			}
			break
		case "Color3uint8": {
			const rgb = chunk.Array(instCount * 3)

			for(let i = 0; i < instCount; i++) {
				values[i] = [rgb[i] / 255, rgb[i + instCount] / 255, rgb[i + instCount * 2] / 255]
			}
			
			resultTypeName = "Color3"
			break
		}
		case "int64": { // Two's complement
			const bytes = chunk.Array(instCount * 8)

			for(let i = 0; i < instCount; i++) {
				let byte0 = bytes[i + instCount * 0] * (256 ** 3) + bytes[i + instCount * 1] * (256 ** 2) +
							bytes[i + instCount * 2] * 256 + bytes[i + instCount * 3]
				
				let byte1 = bytes[i + instCount * 4] * (256 ** 3) + bytes[i + instCount * 5] * (256 ** 2) +
							bytes[i + instCount * 6] * 256 + bytes[i + instCount * 7]
				
				const neg = byte1 % 2
				byte1 = (byte0 % 2) * (2 ** 31) + (byte1 + neg) / 2
				byte0 = Math.floor(byte0 / 2)

				if(byte0 < 2097152) {
					const value = byte0 * (256 ** 4) + byte1
					values[i] = String(neg ? -value : value)
				} else { // Slow path
					let result = ""

					while(byte1 || byte0) {
						const cur0 = byte0
						const res0 = cur0 % 10
						byte0 = (cur0 - res0) / 10

						const cur1 = byte1 + res0 * (256 ** 4)
						const res1 = cur1 % 10
						byte1 = (cur1 - res1) / 10

						result = res1 + result
					}

					values[i] = (neg ? "-" : "") + (result || "0")
				}
			}
			break
		}
		case "SharedString": {
			const indices = chunk.RBXInterleavedUint32(instCount, parser.arrays[parser.arrayIndex++])

			for(let i = 0; i < instCount; i++) {
				values[i] = parser.sharedStrings[indices[i]].value
				console.log("SharedString at "+i+": "+values[i]);
			}
			break
		}
		case "UniqueId": {
			const bytes = chunk.Array(instCount * 16)
			
			for(let i = 0; i < instCount; i++) {
				let result = ""
				
				for(let j = 0; j < 16; j++) {
					const byte = bytes[j * instCount + i]
					result += ("0" + byte.toString(16)).slice(-2)
				}
				
				values[i] = result
				console.log("UniqueId at "+i+": "+result);
			}
			break
		}
		default:
			if(IS_DEV_MODE) {
				if(!typeName) {
					console.warn(`[ParseRBXBin] Unknown dataType 0x${dataType.toString(16).toUpperCase()} (${dataType}) for ${group.ClassName}.${prop}`)
				} else {
					console.warn(`[ParseRBXBin] Unimplemented dataType '${typeName}' for ${group.ClassName}.${prop}`)
				}
			}
			// break omitted
		case "UnknownScriptFormat":
			for(let i = 0; i < instCount; i++) {
				values[i] = `<${typeName || "Unknown"}>`
			}
			break
		}
		
		if(isOptional) {
			if(this.DataTypes[chunk.Byte()] !== "bool" || chunk.GetRemaining() !== instCount) {
				console.warn(`[ParseRBXBin] Missing byte array at end of optional`)
				
				isOptional = false
				for(let i = 0; i < instCount; i++) {
					values[i] = `<Optional>`
				}
			}
		}
		
		for(let index = 0; index < instCount; index++) {
			if(isOptional) {
				if(chunk.Byte() === 0) {
					continue
				}
			}
			
			group.Objects[index].setProperty(prop, values[index], resultTypeName)
		}
	},

	parsePRNT(parser, chunk) {
		chunk.Byte()
		const parentCount = chunk.UInt32LE()
		const childIds = chunk.RBXInterleavedInt32(parentCount, parser.arrays[parser.arrayIndex++])
		const parentIds = chunk.RBXInterleavedInt32(parentCount, parser.arrays[parser.arrayIndex++])

		let childId = 0
		let parentId = 0
		for(let i = 0; i < parentCount; i++) {
			childId += childIds[i]
			parentId += parentIds[i]

			const child = parser.instances[childId]
			if(parentId === -1) {
				parser.result.push(child)
			} else {
				child.setProperty("Parent", parser.instances[parentId], "Instance")
			}
		}
	}
}

const RBXMeshParser = {
	parse(buffer) {
		const reader = new ByteReader(buffer)
		assert(reader.String(8) === "version ", "Invalid mesh file")

		const version = reader.String(4)
		switch(version) {
		case "1.00":
		case "1.01":
			return this.parseText(bufferToString(buffer))
		case "2.00":
		case "3.00":
		case "3.01":
		case "4.00":
		case "4.01":
		case "5.00":
			return this.parseBin(buffer, version)
		default:
			throw new Error(`Unsupported mesh version '${version}'`)
		}
	},

	parseText(str) {
		const lines = str.split(/\r?\n/)
		assert(lines.length === 3, "Invalid mesh version 1 file (Wrong amount of lines)")

		const version = lines[0]
		const faceCount = lines[1]
		const data = lines[2]

		const vectors = data.replace(/\s+/g, "").slice(1, -1).split("][")
		assert(vectors.length === faceCount * 9, "Length mismatch")

		const scaleMultiplier = version === "version 1.00" ? 0.5 : 1
		const vertexCount = faceCount * 3
		const vertices = new Float32Array(vertexCount * 3)
		const normals = new Float32Array(vertexCount * 3)
		const uvs = new Float32Array(vertexCount * 2)
		const faces = new Uint32Array(vertexCount)

		for(let i = 0; i < vertexCount; i++) {
			const n = i * 3
			const vertex = vectors[n].split(",")
			const normal = vectors[n + 1].split(",")
			const uv = vectors[n + 2].split(",")

			vertices[n] = +vertex[0] * scaleMultiplier
			vertices[n + 1] = +vertex[1] * scaleMultiplier
			vertices[n + 2] = +vertex[2] * scaleMultiplier

			normals[n] = +normal[0]
			normals[n + 1] = +normal[1]
			normals[n + 2] = +normal[2]

			uvs[i * 2] = +uv[0]
			uvs[i * 2 + 1] = +uv[1]
			faces[i] = i
		}

		return { vertices, normals, uvs, faces, lods: [0, faceCount], version }
	},

	parseBin(buffer, version) {
		const reader = new ByteReader(buffer)
		assert(reader.String(12) === `version ${version}`, "Bad header")

		const newline = reader.Byte()
		assert(newline === 0x0A || newline === 0x0D && reader.Byte() === 0x0A, "Bad newline")

		const begin = reader.GetIndex()
		
		let headerSize
		let vertexSize
		let faceSize = 12
		let lodSize = 4
		let nameTableSize = 0
		let facsDataSize = 0

		let lodCount = 0
		let vertexCount
		let faceCount
		let boneCount = 0
		let subsetCount = 0

		if(version === "2.00") {
			headerSize = reader.UInt16LE()
			assert(headerSize >= 12, `Invalid header size ${headerSize}`)

			vertexSize = reader.Byte()
			faceSize = reader.Byte()
			vertexCount = reader.UInt32LE()
			faceCount = reader.UInt32LE()
			
		} else if(version.startsWith("3.")) {
			headerSize = reader.UInt16LE()
			assert(headerSize >= 16, `Invalid header size ${headerSize}`)

			vertexSize = reader.Byte()
			faceSize = reader.Byte()
			lodSize = reader.UInt16LE()
			lodCount = reader.UInt16LE()
			vertexCount = reader.UInt32LE()
			faceCount = reader.UInt32LE()
			
		} else if(version.startsWith("4.")) {
			headerSize = reader.UInt16LE()
			assert(headerSize >= 24, `Invalid header size ${headerSize}`)

			reader.Jump(2) // uint16 lodType;
			vertexCount = reader.UInt32LE()
			faceCount = reader.UInt32LE()
			lodCount = reader.UInt16LE()
			boneCount = reader.UInt16LE()
			nameTableSize = reader.UInt32LE()
			subsetCount = reader.UInt16LE()
			reader.Jump(2) // byte numHighQualityLODs, unused;
			
			vertexSize = 40
			
		} else if(version.startsWith("5.")) {
			headerSize = reader.UInt16LE()
			assert(headerSize >= 32, `Invalid header size ${headerSize}`)

			reader.Jump(2) // uint16 meshCount;
			vertexCount = reader.UInt32LE()
			faceCount = reader.UInt32LE()
			lodCount = reader.UInt16LE()
			boneCount = reader.UInt16LE()
			nameTableSize = reader.UInt32LE()
			subsetCount = reader.UInt16LE()
			reader.Jump(2) // byte numHighQualityLODs, unused;
			reader.Jump(4) // uint32 facsDataFormat;
			facsDataSize = reader.UInt32LE()
			
			vertexSize = 40
		}
		
		reader.SetIndex(begin + headerSize)
		
		assert(vertexSize >= 36, `Invalid vertex size ${vertexSize}`)
		assert(faceSize >= 12, `Invalid face size ${faceSize}`)
		assert(lodSize >= 4, `Invalid lod size ${lodSize}`)

		const fileEnd = reader.GetIndex()
			+ (vertexCount * vertexSize)
			+ (boneCount > 0 ? vertexCount * 8 : 0)
			+ (faceCount * faceSize)
			+ (lodCount * lodSize)
			+ (boneCount * 60)
			+ (nameTableSize)
			+ (subsetCount * 72)
			+ (facsDataSize)
		
		assert(fileEnd === reader.GetLength(), `Invalid file size (expected ${reader.GetLength()}, got ${fileEnd})`)
		
		const faces = new Uint32Array(faceCount * 3)
		const vertices = new Float32Array(vertexCount * 3)
		const normals = new Float32Array(vertexCount * 3)
		const uvs = new Float32Array(vertexCount * 2)
		const tangents = new Uint8Array(vertexCount * 4)
		const vertexColors = vertexSize >= 40 ? new Uint8Array(vertexCount * 4) : null
		const lods = []

		const mesh = {
			vertexColors: vertexColors,
			vertices: vertices,
			tangents: tangents,
			normals: normals,
			faces: faces,
			lods: lods,
			uvs: uvs,
			version: version
		}
		
		// Vertex[vertexCount]
		
		for(let i = 0; i < vertexCount; i++) {
			vertices[i * 3] = reader.FloatLE()
			vertices[i * 3 + 1] = reader.FloatLE()
			vertices[i * 3 + 2] = reader.FloatLE()

			normals[i * 3] = reader.FloatLE()
			normals[i * 3 + 1] = reader.FloatLE()
			normals[i * 3 + 2] = reader.FloatLE()

			uvs[i * 2] = reader.FloatLE()
			uvs[i * 2 + 1] = 1 - reader.FloatLE()
			
			// tangents are mapped from [0, 254] to [-1, 1]
			// byte tx, ty, tz, ts;
			
			tangents[i * 4] = reader.Byte() / 127 - 1
			tangents[i * 4 + 1] = reader.Byte() / 127 - 1
			tangents[i * 4 + 2] = reader.Byte() / 127 - 1
			tangents[i * 4 + 3] = reader.Byte() / 127 - 1
			
			if(vertexColors) {
				// byte r, g, b, a
				vertexColors[i * 4] = reader.Byte()
				vertexColors[i * 4 + 1] = reader.Byte()
				vertexColors[i * 4 + 2] = reader.Byte()
				vertexColors[i * 4 + 3] = reader.Byte()
				
				reader.Jump(vertexSize - 40)
			} else {
				reader.Jump(vertexSize - 36)
			}
		}
		
		// Envelope[vertexCount]
		
		if(boneCount > 0) {
			mesh.skinIndices = new Uint8Array(vertexCount * 4)
			mesh.skinWeights = new Float32Array(vertexCount * 4)
			
			for(let i = 0; i < vertexCount; i++) {
				mesh.skinIndices[i * 4 + 0] = reader.Byte()
				mesh.skinIndices[i * 4 + 1] = reader.Byte()
				mesh.skinIndices[i * 4 + 2] = reader.Byte()
				mesh.skinIndices[i * 4 + 3] = reader.Byte()
				mesh.skinWeights[i * 4 + 0] = reader.Byte() / 255
				mesh.skinWeights[i * 4 + 1] = reader.Byte() / 255
				mesh.skinWeights[i * 4 + 2] = reader.Byte() / 255
				mesh.skinWeights[i * 4 + 3] = reader.Byte() / 255
			}
		}
		
		// Face[faceCount]
		
		for(let i = 0; i < faceCount; i++) {
			faces[i * 3] = reader.UInt32LE()
			faces[i * 3 + 1] = reader.UInt32LE()
			faces[i * 3 + 2] = reader.UInt32LE()

			reader.Jump(faceSize - 12)
		}
		
		// LodLevel[lodCount]
		
		if(lodCount <= 2) {
			// Lod levels are pretty much ignored if lodCount
			// is not at least 3, so we can just skip reading
			// them completely.
			
			lods.push(0, faceCount)
			reader.Jump(lodCount * lodSize)
		} else {
			for(let i = 0; i < lodCount; i++) {
				lods.push(reader.UInt32LE())
				reader.Jump(lodSize - 4)
			}
			console.log("LOD count: "+lodCount);
		}
		
		// Bone[boneCount]

		console.log("Bone count: "+boneCount);

		if(boneCount > 0) {
			const nameTableStart = reader.GetIndex() + boneCount * 60
			
			mesh.bones = new Array(boneCount)
			
			for(let i = 0; i < boneCount; i++) {
				const bone = {}
				
				const nameStart = nameTableStart + reader.UInt32LE()
				const nameEnd = reader.indexOf(0, nameStart)
				
				bone.name = bufferToString(reader.subarray(nameStart, nameEnd))
				bone.parent = mesh.bones[reader.UInt16LE()]
				bone.lodParent = mesh.bones[reader.UInt16LE()]
				bone.culling = reader.FloatLE()
				bone.cframe = new Array(12)
				
				for(let i = 0; i < 9; i++) {
					bone.cframe[i + 3] = reader.FloatLE()
				}
				
				for(let i = 0; i < 3; i++) {
					bone.cframe[i] = reader.FloatLE()
				}
				
				mesh.bones[i] = bone
			}
		}
		
		// byte[nameTableSize]

		if(nameTableSize > 0) {
			reader.Jump(nameTableSize)
		}
		
		// MeshSubset[subsetCount]

		console.log("Mesh subset count: "+subsetCount);

		if(subsetCount > 0) {
			const boneIndices = []
			
			for(let i = 0; i < subsetCount; i++) {
				reader.UInt32LE() // facesBegin
				reader.UInt32LE() // facesLength
				const vertsBegin = reader.UInt32LE()
				const vertsLength = reader.UInt32LE()
				reader.UInt32LE() // numBoneIndices
				
				for(let i = 0; i < 26; i++) {
					boneIndices[i] = reader.UInt16LE()
				}
				
				const vertsEnd = vertsBegin + vertsLength
				for(let i = vertsBegin; i < vertsEnd; i++) {
					mesh.skinIndices[i * 4 + 0] = boneIndices[mesh.skinIndices[i * 4 + 0]]
					mesh.skinIndices[i * 4 + 1] = boneIndices[mesh.skinIndices[i * 4 + 1]]
					mesh.skinIndices[i * 4 + 2] = boneIndices[mesh.skinIndices[i * 4 + 2]]
					mesh.skinIndices[i * 4 + 3] = boneIndices[mesh.skinIndices[i * 4 + 3]]
				}
			}
		}
		
		// byte[facsDataSize]
		
		if(facsDataSize > 0) {
			reader.Jump(facsDataSize)
		}

		//

		return mesh
	}
}

function convertMeshObjectToObj(mesh) {
const lines = []

				lines.push("o Mesh")
				console.log("Vertices: "+mesh.vertices.length);
				for(let i = 0, len = mesh.vertices.length; i < len; i += 3) {
					lines.push(`v ${mesh.vertices[i]} ${mesh.vertices[i + 1]} ${mesh.vertices[i + 2]}`)
				}

				lines.push("")

				console.log("Normals: "+mesh.normals.length);
				for(let i = 0, len = mesh.normals.length; i < len; i += 3) {
					lines.push(`vn ${mesh.normals[i]} ${mesh.normals[i + 1]} ${mesh.normals[i + 2]}`)
				}

				lines.push("")

				console.log("UVs: "+mesh.uvs.length);
				for(let i = 0, len = mesh.uvs.length; i < len; i += 2) {
					lines.push(`vt ${mesh.uvs[i]} ${mesh.uvs[i + 1]}`)
				}

				lines.push("")
				
				// only use the first lod
				const faces = mesh.faces.subarray(mesh.lods[0] * 3, mesh.lods[1] * 3)
				
				console.log("Faces: "+faces.length);
                                console.log("Total faces: "+mesh.faces.length);
				for(let i = 0, len = faces.length; i < len; i += 3) {
					const a = faces[i] + 1
					const b = faces[i + 1] + 1
					const c = faces[i + 2] + 1
					lines.push(`f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}`)
				}

return lines.join("\n");
}

function toArrayBuffer(buffer) {
  const arrayBuffer = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(arrayBuffer);
  for (let i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return arrayBuffer;
}

function newToText(str) {
	try {
	let test = RBXMeshParser.parse(str);
	if(test) {
	let final = [];
	let ver = "1.01";
	for(let i = 0; i < test.vertices.length; i += 3) {
	let outp1 = [];
	let outp2 = [];
	let outp3 = [];
	let vx = test.vertices[i];
	let vy = test.vertices[i+1];
	let vz = test.vertices[i+2];
	let nx = test.normals[i];
	let ny = test.normals[i+1];
	let nz = test.normals[i+2];
	let tx = test.uvs[i];
	let ty = test.uvs[i+1];
	assert(vx, "Vertice is missing");
	assert(vy, "Vertice is missing");
	assert(vz, "Vertice is missing");
	assert(nx, "Normal is missing");
	assert(ny, "Normal is missing");
	assert(nz, "Normal is missing");
	let willHaveTexture = true;
	if(!ty || !tx) {
		willHaveTexture = false;
	}
	let scale = (ver == "1.00") ? 2 : 1;
	let ver10inv = (ver == "1.00") ? 1.0 : 0.0;
	outp1.push((vx * scale));
	outp1.push((vy * scale));
	outp1.push((vz * scale));
	let outp1str = "["+outp1.join(",")+"]";
	outp2.push(nx);
	outp2.push(ny);
	outp2.push(nz);
	let outp2str = "["+outp2.join(",")+"]";
	if(willHaveTexture) {
	outp3.push(tx);
	outp3.push((ver10inv - ty));
	} else {
	outp3.push("0");
	outp3.push("0");
	}
	outp3.push("0");
	let outp3str = "["+outp3.join(",")+"]";
	let outp = outp1str+outp2str+outp3str;
	final.push(outp);
	}
	return "version "+ver+'\r\n'+test.faces.length+'\r\n'+final.join("");
	}
	} catch(e) { console.error(e); }
	return false;
}

module.exports = {
toArrayBuffer,
convertMeshObjectToObj,
newToText,
RBXMeshParser,
RBXInstance,
RBXInstanceRoot,
RBXInstanceUtils
}