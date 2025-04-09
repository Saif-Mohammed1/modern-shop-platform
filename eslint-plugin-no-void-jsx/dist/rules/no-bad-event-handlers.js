"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rule = {
    meta: {
        type: "problem",
        docs: {
            description: "Detect problematic event handler patterns in JSX",
        },
        messages: {
            noBadEventHandler: "{{ message }}",
        },
        schema: [],
        fixable: "code",
    },
    defaultOptions: [],
    create(context) {
        return {
            JSXAttribute(node) {
                const attributeName = node.name.name;
                if (typeof attributeName !== "string" ||
                    !/^on[A-Z]/.test(attributeName)) {
                    return;
                }
                const { value } = node;
                if (!value || value.type !== "JSXExpressionContainer") {
                    return;
                }
                const { expression } = value;
                if (!expression) {
                    return;
                }
                let message = null;
                // Case 1: Direct function reference (Identifier)
                if (expression.type === "Identifier") {
                    // message =
                    //   "Direct function reference in event handler. Pass a function that returns the handler instead.";
                    return;
                }
                // Case 2: Void operator usage at top level
                else if (expression.type === "UnaryExpression" &&
                    expression.operator === "void") {
                    message =
                        "Void operator in event handler. This indicates potential anti-pattern.";
                }
                // Case 3: Arrow function with non-void body
                // else if (expression.type === "ArrowFunctionExpression") {
                //   const { body } = expression;
                //   // Check if the arrow function body is a void expression
                //   const isBodyVoid =
                //     body.type === "UnaryExpression" && body.operator === "void";
                //   if (!isBodyVoid) {
                //     message =
                //       "Arrow function in event handler. Avoid inline functions for better performance.";
                //   }
                // }
                // In your rule's create() function
                else if (expression.type === "ArrowFunctionExpression") {
                    const { body } = expression;
                    const { params } = expression;
                    // Allow arrow functions when:
                    // 1. Parameters are being used
                    // 2. It's a simple passthrough (no extra logic)
                    const isSimpleWrapper = params.length > 0 &&
                        ((body.type === "CallExpression" &&
                            body.arguments.length === params.length) ||
                            (body.type === "BlockStatement" &&
                                body.body.length === 1 &&
                                body.body[0].type === "ExpressionStatement"));
                    if (!isSimpleWrapper) {
                        message =
                            "Arrow function in event handler. Avoid inline functions for better performance.";
                    }
                }
                if (message) {
                    context.report({
                        node,
                        messageId: "noBadEventHandler",
                        data: { message },
                    });
                }
            },
        };
    },
};
exports.default = rule;
