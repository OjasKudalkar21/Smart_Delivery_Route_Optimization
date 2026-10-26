#ifndef SIMPLE_JSON_HPP
#define SIMPLE_JSON_HPP

#include <string>
#include <vector>
#include <map>
#include <sstream>
#include <stdexcept>
#include <cctype>
#include <iostream>
#include <iomanip>

/**
 * @brief Self-contained, robust JSON parser and serializer for RoutePilot.
 * Supports null, boolean, numbers (integer/floating-point), strings, arrays, and objects.
 */
class JsonValue {
public:
    enum class Type { Null, Boolean, Number, String, Array, Object };

private:
    Type type_ = Type::Null;
    bool boolVal_ = false;
    double numVal_ = 0.0;
    std::string strVal_;
    std::vector<JsonValue> arrVal_;
    std::map<std::string, JsonValue> objVal_;

public:
    JsonValue() : type_(Type::Null) {}
    JsonValue(std::nullptr_t) : type_(Type::Null) {}
    JsonValue(bool b) : type_(Type::Boolean), boolVal_(b) {}
    JsonValue(int n) : type_(Type::Number), numVal_(static_cast<double>(n)) {}
    JsonValue(size_t n) : type_(Type::Number), numVal_(static_cast<double>(n)) {}
    JsonValue(double n) : type_(Type::Number), numVal_(n) {}
    JsonValue(const char* s) : type_(Type::String), strVal_(s ? s : "") {}
    JsonValue(std::string s) : type_(Type::String), strVal_(std::move(s)) {}
    JsonValue(std::vector<JsonValue> arr) : type_(Type::Array), arrVal_(std::move(arr)) {}
    JsonValue(std::map<std::string, JsonValue> obj) : type_(Type::Object), objVal_(std::move(obj)) {}

    Type getType() const { return type_; }
    bool isNull() const { return type_ == Type::Null; }
    bool isBool() const { return type_ == Type::Boolean; }
    bool isNumber() const { return type_ == Type::Number; }
    bool isString() const { return type_ == Type::String; }
    bool isArray() const { return type_ == Type::Array; }
    bool isObject() const { return type_ == Type::Object; }

    bool asBool(bool def = false) const {
        return isBool() ? boolVal_ : def;
    }

    double asDouble(double def = 0.0) const {
        return isNumber() ? numVal_ : def;
    }

    int asInt(int def = 0) const {
        return isNumber() ? static_cast<int>(numVal_) : def;
    }

    const std::string& asString(const std::string& def = "") const {
        return isString() ? strVal_ : def;
    }

    const std::vector<JsonValue>& asArray() const {
        static const std::vector<JsonValue> emptyArr;
        return isArray() ? arrVal_ : emptyArr;
    }

    std::vector<JsonValue>& asArray() {
        if (!isArray()) {
            type_ = Type::Array;
            arrVal_.clear();
        }
        return arrVal_;
    }

    const std::map<std::string, JsonValue>& asObject() const {
        static const std::map<std::string, JsonValue> emptyObj;
        return isObject() ? objVal_ : emptyObj;
    }

    std::map<std::string, JsonValue>& asObject() {
        if (!isObject()) {
            type_ = Type::Object;
            objVal_.clear();
        }
        return objVal_;
    }

    bool contains(const std::string& key) const {
        if (!isObject()) return false;
        return objVal_.find(key) != objVal_.end();
    }

    const JsonValue& operator[](const std::string& key) const {
        static const JsonValue nullVal;
        if (!isObject()) return nullVal;
        auto it = objVal_.find(key);
        return (it != objVal_.end()) ? it->second : nullVal;
    }

    JsonValue& operator[](const std::string& key) {
        if (!isObject()) {
            type_ = Type::Object;
            objVal_.clear();
        }
        return objVal_[key];
    }

    const JsonValue& operator[](size_t index) const {
        static const JsonValue nullVal;
        if (!isArray() || index >= arrVal_.size()) return nullVal;
        return arrVal_[index];
    }

    void push_back(JsonValue val) {
        if (!isArray()) {
            type_ = Type::Array;
            arrVal_.clear();
        }
        arrVal_.push_back(std::move(val));
    }

    size_t size() const {
        if (isArray()) return arrVal_.size();
        if (isObject()) return objVal_.size();
        return 0;
    }

    // Serialization
    std::string serialize(int indent = -1, int currentIndent = 0) const {
        std::ostringstream ss;
        serializeHelper(ss, indent, currentIndent);
        return ss.str();
    }

private:
    void serializeHelper(std::ostringstream& ss, int indent, int currentIndent) const {
        std::string nl = (indent >= 0) ? "\n" : "";
        std::string sp = (indent >= 0) ? std::string(currentIndent, ' ') : "";
        std::string nextSp = (indent >= 0) ? std::string(currentIndent + indent, ' ') : "";

        switch (type_) {
            case Type::Null:
                ss << "null";
                break;
            case Type::Boolean:
                ss << (boolVal_ ? "true" : "false");
                break;
            case Type::Number: {
                if (numVal_ == static_cast<long long>(numVal_)) {
                    ss << static_cast<long long>(numVal_);
                } else {
                    ss << std::fixed << std::setprecision(4) << numVal_;
                    // Trim trailing zeros
                    std::string str = ss.str();
                    // Just basic number print
                }
                break;
            }
            case Type::String:
                escapeString(ss, strVal_);
                break;
            case Type::Array: {
                if (arrVal_.empty()) {
                    ss << "[]";
                    break;
                }
                ss << "[" << nl;
                for (size_t i = 0; i < arrVal_.size(); ++i) {
                    ss << nextSp;
                    arrVal_[i].serializeHelper(ss, indent, currentIndent + indent);
                    if (i + 1 < arrVal_.size()) ss << ",";
                    ss << nl;
                }
                ss << sp << "]";
                break;
            }
            case Type::Object: {
                if (objVal_.empty()) {
                    ss << "{}";
                    break;
                }
                ss << "{" << nl;
                size_t count = 0;
                for (const auto& pair : objVal_) {
                    ss << nextSp;
                    escapeString(ss, pair.first);
                    ss << (indent >= 0 ? ": " : ":");
                    pair.second.serializeHelper(ss, indent, currentIndent + indent);
                    if (++count < objVal_.size()) ss << ",";
                    ss << nl;
                }
                ss << sp << "}";
                break;
            }
        }
    }

    static void escapeString(std::ostringstream& ss, const std::string& str) {
        ss << '"';
        for (char c : str) {
            switch (c) {
                case '"':  ss << "\\\""; break;
                case '\\': ss << "\\\\"; break;
                case '\b': ss << "\\b";  break;
                case '\f': ss << "\\f";  break;
                case '\n': ss << "\\n";  break;
                case '\r': ss << "\\r";  break;
                case '\t': ss << "\\t";  break;
                default:
                    if (static_cast<unsigned char>(c) < 0x20) {
                        ss << "\\u" << std::hex << std::setw(4) << std::setfill('0') << static_cast<int>(c);
                    } else {
                        ss << c;
                    }
            }
        }
        ss << '"';
    }

public:
    // Parsing
    static JsonValue parse(const std::string& jsonStr) {
        size_t idx = 0;
        skipWhitespace(jsonStr, idx);
        JsonValue result = parseValue(jsonStr, idx);
        skipWhitespace(jsonStr, idx);
        if (idx < jsonStr.size()) {
            throw std::runtime_error("Unexpected trailing characters at position " + std::to_string(idx));
        }
        return result;
    }

    static JsonValue parse(std::istream& in) {
        std::string content((std::istreambuf_iterator<char>(in)), std::istreambuf_iterator<char>());
        return parse(content);
    }

private:
    static void skipWhitespace(const std::string& s, size_t& idx) {
        while (idx < s.size() && (std::isspace(s[idx]) || s[idx] == '\0')) {
            idx++;
        }
    }

    static JsonValue parseValue(const std::string& s, size_t& idx) {
        skipWhitespace(s, idx);
        if (idx >= s.size()) {
            throw std::runtime_error("Unexpected end of input while parsing JSON value");
        }

        char c = s[idx];
        if (c == 'n') return parseNull(s, idx);
        if (c == 't' || c == 'f') return parseBool(s, idx);
        if (c == '"') return parseString(s, idx);
        if (c == '[') return parseArray(s, idx);
        if (c == '{') return parseObject(s, idx);
        if (c == '-' || std::isdigit(c)) return parseNumber(s, idx);

        throw std::runtime_error("Invalid JSON character '" + std::string(1, c) + "' at position " + std::to_string(idx));
    }

    static JsonValue parseNull(const std::string& s, size_t& idx) {
        if (s.compare(idx, 4, "null") == 0) {
            idx += 4;
            return JsonValue();
        }
        throw std::runtime_error("Failed parsing null at position " + std::to_string(idx));
    }

    static JsonValue parseBool(const std::string& s, size_t& idx) {
        if (s.compare(idx, 4, "true") == 0) {
            idx += 4;
            return JsonValue(true);
        }
        if (s.compare(idx, 5, "false") == 0) {
            idx += 5;
            return JsonValue(false);
        }
        throw std::runtime_error("Failed parsing boolean at position " + std::to_string(idx));
    }

    static JsonValue parseNumber(const std::string& s, size_t& idx) {
        size_t start = idx;
        if (s[idx] == '-') idx++;
        while (idx < s.size() && std::isdigit(s[idx])) idx++;
        if (idx < s.size() && s[idx] == '.') {
            idx++;
            while (idx < s.size() && std::isdigit(s[idx])) idx++;
        }
        if (idx < s.size() && (s[idx] == 'e' || s[idx] == 'E')) {
            idx++;
            if (idx < s.size() && (s[idx] == '+' || s[idx] == '-')) idx++;
            while (idx < s.size() && std::isdigit(s[idx])) idx++;
        }

        std::string numStr = s.substr(start, idx - start);
        double val = std::stod(numStr);
        return JsonValue(val);
    }

    static JsonValue parseString(const std::string& s, size_t& idx) {
        idx++; // skip opening quote
        std::string res;
        while (idx < s.size()) {
            char c = s[idx++];
            if (c == '"') return JsonValue(res);
            if (c == '\\') {
                if (idx >= s.size()) throw std::runtime_error("Unterminated string escape");
                char esc = s[idx++];
                switch (esc) {
                    case '"': res += '"'; break;
                    case '\\': res += '\\'; break;
                    case '/': res += '/'; break;
                    case 'b': res += '\b'; break;
                    case 'f': res += '\f'; break;
                    case 'n': res += '\n'; break;
                    case 'r': res += '\r'; break;
                    case 't': res += '\t'; break;
                    case 'u': {
                        if (idx + 4 > s.size()) throw std::runtime_error("Invalid unicode escape");
                        std::string hex = s.substr(idx, 4);
                        idx += 4;
                        int code = std::stoi(hex, nullptr, 16);
                        res += static_cast<char>(code);
                        break;
                    }
                    default: res += esc; break;
                }
            } else {
                res += c;
            }
        }
        throw std::runtime_error("Unclosed string literal in JSON input");
    }

    static JsonValue parseArray(const std::string& s, size_t& idx) {
        idx++; // skip '['
        std::vector<JsonValue> arr;
        skipWhitespace(s, idx);
        if (idx < s.size() && s[idx] == ']') {
            idx++;
            return JsonValue(arr);
        }

        while (idx < s.size()) {
            arr.push_back(parseValue(s, idx));
            skipWhitespace(s, idx);
            if (idx < s.size() && s[idx] == ']') {
                idx++;
                return JsonValue(arr);
            }
            if (idx < s.size() && s[idx] == ',') {
                idx++;
            } else {
                throw std::runtime_error("Expected ',' or ']' in array at position " + std::to_string(idx));
            }
        }
        throw std::runtime_error("Unclosed array in JSON input");
    }

    static JsonValue parseObject(const std::string& s, size_t& idx) {
        idx++; // skip '{'
        std::map<std::string, JsonValue> obj;
        skipWhitespace(s, idx);
        if (idx < s.size() && s[idx] == '}') {
            idx++;
            return JsonValue(obj);
        }

        while (idx < s.size()) {
            skipWhitespace(s, idx);
            if (idx >= s.size() || s[idx] != '"') {
                throw std::runtime_error("Expected string key in object at position " + std::to_string(idx));
            }
            JsonValue keyVal = parseString(s, idx);
            std::string key = keyVal.asString();

            skipWhitespace(s, idx);
            if (idx >= s.size() || s[idx] != ':') {
                throw std::runtime_error("Expected ':' after key in object at position " + std::to_string(idx));
            }
            idx++; // skip ':'

            obj[key] = parseValue(s, idx);

            skipWhitespace(s, idx);
            if (idx < s.size() && s[idx] == '}') {
                idx++;
                return JsonValue(obj);
            }
            if (idx < s.size() && s[idx] == ',') {
                idx++;
            } else {
                throw std::runtime_error("Expected ',' or '}' in object at position " + std::to_string(idx));
            }
        }
        throw std::runtime_error("Unclosed object in JSON input");
    }
};

#endif // SIMPLE_JSON_HPP
