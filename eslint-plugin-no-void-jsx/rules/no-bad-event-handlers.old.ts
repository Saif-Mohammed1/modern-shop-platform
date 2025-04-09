import type { Rule } from "eslint";

const rule: Rule.RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce proper event handler patterns in JSX",
      //   recommended: "error",
    },
    messages: {
      directFunction:
        "Direct function reference in event handler. Wrap with proper event handling.",
      missingPreventDefault:
        "Missing e.preventDefault() in form submission handler",
      voidOperator: "Avoid void operator in event handlers",
      uninvokedFunction:
        "Uninvoked function in handler. Use () => yourFunction() pattern.",
      directInvocation:
        "Avoid direct function invocation. Wrap in arrow function.",
    },
    schema: [],
    fixable: "code",
    defaultOptions: [], // Add this required property
  },
  create(context) {
    const { sourceCode } = context;

    interface JSXElementNode {
      name: {
        type: string;
        name: string;
      };
    }

    const isFormElement = (node: JSXElementNode): boolean =>
      node.name.type === "JSXIdentifier" && node.name.name === "form";

    const isEventHandler = (name: string) => /^on[A-Z]/.test(name);

    // const checkFormSubmission = (node: ) => {
    //   if (node.value?.type === "JSXExpressionContainer") {
    //     const expr = node.value.expression;

    //     if (
    //       expr?.type === "Identifier" ||
    //       (expr?.type === "ArrowFunctionExpression" &&
    //         !hasPreventDefault(expr.body))
    //     ) {
    //       context.report({
    //         node: node ,
    //         messageId: "missingPreventDefault",
    //         fix(fixer) {
    //           const handlerText =
    //             expr.type === "Identifier"
    //               ? sourceCode.getText(expr)
    //               : sourceCode.getText(expr.body as );

    //           return fixer.replaceText(
    //             node.value ,
    //             `(e) => {
    //               e.preventDefault();
    //               ${handlerText}(e);
    //             }`
    //           );
    //         },
    //       });
    //     }
    //   }
    // };
    interface JSXAttributeNode {
      name: {
        type: string;
        name: string;
      };
      value?: {
        type: string;
        expression?: {
          type: string;
          body?: Rule.Node;
        };
      };
      parent: JSXElementNode;
    }

    const checkFormSubmission = (node: JSXAttributeNode): void => {
      if (node.value?.type === "JSXExpressionContainer") {
        const expr = node.value.expression;

        // Only check inline handlers, ignore function references
        if (expr?.type === "ArrowFunctionExpression") {
          const hasPrevention = hasPreventDefault(expr.body as Rule.Node);
          const hasIndirectPrevention = containsPreventDefaultCall(
            expr.body as Rule.Node
          );

          if (!hasPrevention && !hasIndirectPrevention) {
            context.report({
              node: expr as Rule.Node,
              messageId: "missingPreventDefault",
              fix(fixer) {
                return fixer.insertTextBefore(
                  expr.body as Rule.Node,
                  "e.preventDefault();\n"
                );
              },
            });
          }
        }
      }
    };

    // Helper to check for e.preventDefault() in nested calls
    function containsPreventDefaultCall(node: Rule.Node): boolean {
      if (node.type === "CallExpression") {
        return context.sourceCode.getText(node).includes(".preventDefault()");
      }
      return false;
    }
    interface GeneralHandlerNode extends JSXAttributeNode {
      value?: {
        type: string;
        expression?: {
          type: string;
          operator?: string;
          argument?: Rule.Node;
          body?: Rule.Node;
        };
      };
    }

    const checkGeneralHandler = (node: GeneralHandlerNode): void => {
      if (node.value?.type === "JSXExpressionContainer") {
        const expr = node.value.expression;

        if (expr?.type === "UnaryExpression" && expr.operator === "void") {
          context.report({
            node: expr as Rule.Node,
            messageId: "voidOperator",
            fix(fixer) {
              return fixer.replaceText(
                expr,
                `() => ${sourceCode.getText(expr.argument)}`
              );
            },
          });
        }

        if (expr?.type === "Identifier" || expr?.type === "CallExpression") {
          context.report({
            node: expr as Rule.Node,
            messageId: "directInvocation",
            fix(fixer) {
              return fixer.replaceText(
                expr,
                `() => ${sourceCode.getText(expr as Rule.Node)}`
              );
            },
          });
        }

        if (
          expr?.type === "ArrowFunctionExpression" &&
          expr.body?.type === "Identifier"
        ) {
          context.report({
            node: expr.body as Rule.Node,
            messageId: "uninvokedFunction",
            fix(fixer) {
              return fixer.insertTextAfter(expr.body, "()");
            },
          });
        }
      }
    };

    return {
      JSXAttribute(node: JSXAttributeNode) {
        if (
          node.name?.type === "JSXIdentifier" &&
          isEventHandler(node.name.name)
        ) {
          const { parent } = node;
          isFormElement(parent) && node.name.name === "onSubmit"
            ? checkFormSubmission(node)
            : checkGeneralHandler(node);
        }
      },
    };
  },
};

export default {
  rules: {
    "safe-event-handlers": rule,
  },
};

function hasPreventDefault(node: Rule.Node): boolean {
  if (node.type === "BlockStatement") {
    return node.body.some(
      (statement) =>
        statement.type === "ExpressionStatement" &&
        statement.expression.type === "CallExpression" &&
        statement.expression.callee.type === "MemberExpression" &&
        statement.expression.callee.object.type === "Identifier" &&
        statement.expression.callee.object.name === "e" &&
        statement.expression.callee.property.type === "Identifier" &&
        statement.expression.callee.property.name === "preventDefault"
    );
  }
  return false;
}
