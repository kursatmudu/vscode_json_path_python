// Used from https://github.com/richie5um/vscode-statusbar-json-path

enum ColType { Object, Array }
interface Frame {
    colType: ColType
    index?: number
    key?: string
}

export function jsonpathpy(text: string, offset: number) {
    let position = 0;
    let stack: Frame[] = [];
    let isInKey = false;

    while (position < offset) {
        const startposition = position;
        switch (text[position]) {
            case '"':

                const { text: s, position: newposition } = read_str(text, position);
                if (stack.length) {
                    const frame = stack[stack.length - 1];
                    if (frame.colType == ColType.Object && isInKey) {
                        frame.key = s;
                        isInKey = false;
                    }
                }
                position = newposition
                break;
            case '{':
                stack.push({ colType: ColType.Object });
                isInKey = true;
                break;
            case '[':
                stack.push({ colType: ColType.Array, index: 0 })
                break;
            case '}':
            case ']':
                stack.pop();
                break;
            case ',':
                if (stack.length) {
                    const frame = stack[stack.length - 1];
                    if (frame) {
                        if (frame.colType == ColType.Object) {
                            isInKey = true;
                        } else if (frame.index !== undefined) {
                            frame.index++;
                        }
                    }
                }
                break;
        }
        if (position == startposition) {
            position++;
        }
    }

    return path_str(stack);
}

function path_str(path: Frame[]): string {
    let json_str = '';
    for (const frame of path) {
        if (frame.colType == ColType.Object) {

            if (frame.key) {
                if (!frame.key.match(/^[a-zA-Z$#@&%~\-_][a-zA-Z\d$#@&%~\-_]*$/)) {
                    const key = frame.key.replace('"', '\\"');
                    json_str += `["${frame.key}"]`;
                    json_str = json_str.replace('"',"'").replace('"',"'")
                } else {
                    if (json_str.length) {
                        json_str += '';
                    }
                    json_str += "['" + frame.key + "']";
                }
            }
        } else {
            json_str += `[${frame.index}]`;
        }
    }
    return json_str
}

function read_str(text: string, position: number): { text: string, position: number } {
    let count = position + 1;
    count = find_end(text, count);
    var textposition = {
        text: text.substring(position + 1, count),
        position: count + 1
    };
    return textposition;
}

function check_even(num: number) {
    return num % 2 == 0;
}

function check_odd(num: number) {
    return !check_even(num);
}

function find_end(text: string, counter: number) {
    while (counter < text.length) {
        if (text[counter] == '"') {
            var counter_count = counter;
            while (0 <= counter_count && text[counter_count] == '\\') {
                counter_count--;
            }
            if (check_even(counter - counter_count)) {
                break;
            }
        }
        counter++;
    }

    return counter;
}

