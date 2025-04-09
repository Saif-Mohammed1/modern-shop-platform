"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rule = {
    meta: {
        type: "problem",
        docs: {
            description: "Enforce proper event handler patterns in JSX",
            //   recommended: "error",
        },
        messages: {
            directFunction: "Direct function reference in event handler. Wrap with proper event handling.",
            missingPreventDefault: "Missing e.preventDefault() in form submission handler",
            voidOperator: "Avoid void operator in event handlers",
            uninvokedFunction: "Uninvoked function in handler. Use () => yourFunction() pattern.",
            directInvocation: "Avoid direct function invocation. Wrap in arrow function.",
        },
        schema: [],
        fixable: "code",
        defaultOptions: [], // Add this required property
    },
    create(context) {
        const { sourceCode } = context;
        const isFormElement = (node) => node.name.type === "JSXIdentifier" && node.name.name === "form";
        const isEventHandler = (name) => /^on[A-Z]/.test(name);
        const checkFormSubmission = (node) => {
            if (node.value?.type === "JSXExpressionContainer") {
                const expr = node.value.expression;
                // Only check inline handlers, ignore function references
                if (expr?.type === "ArrowFunctionExpression") {
                    const hasPrevention = hasPreventDefault(expr.body);
                    const hasIndirectPrevention = containsPreventDefaultCall(expr.body);
                    if (!hasPrevention && !hasIndirectPrevention) {
                        context.report({
                            node: expr,
                            messageId: "missingPreventDefault",
                            fix(fixer) {
                                return fixer.insertTextBefore(expr.body, "e.preventDefault();\n");
                            },
                        });
                    }
                }
            }
        };
        // Helper to check for e.preventDefault() in nested calls
        function containsPreventDefaultCall(node) {
            if (node.type === "CallExpression") {
                return context.sourceCode.getText(node).includes(".preventDefault()");
            }
            return false;
        }
        const checkGeneralHandler = (node) => {
            if (node.value?.type === "JSXExpressionContainer") {
                const expr = node.value.expression;
                if (expr?.type === "UnaryExpression" && expr.operator === "void") {
                    context.report({
                        node: expr,
                        messageId: "voidOperator",
                        fix(fixer) {
                            return fixer.replaceText(expr, `() => ${sourceCode.getText(expr.argument)}`);
                        },
                    });
                }
                if (expr?.type === "Identifier" || expr?.type === "CallExpression") {
                    context.report({
                        node: expr,
                        messageId: "directInvocation",
                        fix(fixer) {
                            return fixer.replaceText(expr, `() => ${sourceCode.getText(expr)}`);
                        },
                    });
                }
                if (expr?.type === "ArrowFunctionExpression" &&
                    expr.body?.type === "Identifier") {
                    context.report({
                        node: expr.body,
                        messageId: "uninvokedFunction",
                        fix(fixer) {
                            return fixer.insertTextAfter(expr.body, "()");
                        },
                    });
                }
            }
        };
        return {
            JSXAttribute(node) {
                if (node.name?.type === "JSXIdentifier" &&
                    isEventHandler(node.name.name)) {
                    const { parent } = node;
                    isFormElement(parent) && node.name.name === "onSubmit"
                        ? checkFormSubmission(node)
                        : checkGeneralHandler(node);
                }
            },
        };
    },
};
exports.default = {
    rules: {
        "safe-event-handlers": rule,
    },
};
function hasPreventDefault(node) {
    if (node.type === "BlockStatement") {
        return node.body.some((statement) => statement.type === "ExpressionStatement" &&
            statement.expression.type === "CallExpression" &&
            statement.expression.callee.type === "MemberExpression" &&
            statement.expression.callee.object.type === "Identifier" &&
            statement.expression.callee.object.name === "e" &&
            statement.expression.callee.property.type === "Identifier" &&
            statement.expression.callee.property.name === "preventDefault");
    }
    return false;
}
