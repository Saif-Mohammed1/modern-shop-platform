// import type { TSESTree } from "@typescript-eslint/types";
// import type { TSESLint } from "@typescript-eslint/utils";

// const rule: TSESLint.RuleModule<"noNestedButtons"> = {
//   meta: {
//     type: "problem",
//     docs: {
//       description: "Prevent nesting button elements",
//       //   recommended: "error",
//     },
//     messages: {
//       noNestedButtons:
//         "Nested buttons are not allowed. Found {{ parent }} > {{ child }}.",
//     },
//     schema: [],
//   },
//   defaultOptions: [],
//   create(context) {
//     const buttonStack: string[] = [];

//     function isButtonElement(
//       node: TSESTree.JSXOpeningElement | TSESTree.JSXClosingElement
//     ): boolean {
//       const { name } = node;

//       if (name.type === "JSXIdentifier") {
//         return name.name.toLowerCase().endsWith("button");
//       }

//       if (name.type === "JSXMemberExpression") {
//         const { property } = name;
//         return (
//           property.type === "JSXIdentifier" &&
//           property.name.toLowerCase().endsWith("button")
//         );
//       }

//       return false;
//     }

//     function getComponentName(name: TSESTree.JSXTagNameExpression): string {
//       if (name.type === "JSXIdentifier") {
//         return name.name;
//       }
//       if (name.type === "JSXMemberExpression") {
//         return `${getComponentName(name.object)}.${getComponentName(name.property)}`;
//       }
//       return "";
//     }

//     // return {
//     //   JSXOpeningElement(node) {
//     //     if (isButtonElement(node)) {
//     //       if (buttonStack.length > 0) {
//     //         context.report({
//     //           node,
//     //           messageId: "noNestedButtons",
//     //           data: {
//     //             parent: buttonStack[buttonStack.length - 1],
//     //             child: getComponentName(node.name),
//     //           },
//     //         });
//     //       }
//     //       buttonStack.push(getComponentName(node.name));
//     //     }
//     //   },

//     //   JSXClosingElement(node) {
//     //     if (isButtonElement(node)) {
//     //       buttonStack.pop();
//     //     }
//     //   },
//     // };
//     // In your no-nested-buttons rule
//     return {
//       JSXElement(node) {
//         if (
//           node.openingElement.selfClosing &&
//           isButtonElement(node.openingElement)
//         ) {
//           // Check for nesting but don't leave in stack
//           if (buttonStack.length > 0) {
//             context.report({
//               node: node.openingElement,
//               messageId: "noNestedButtons",
//               data: {
//                 parent: buttonStack[buttonStack.length - 1],
//                 child: getComponentName(node.openingElement.name),
//               },
//             });
//           }
//           // Do NOT push to stack (self-closing can't have children)
//         }
//       },

//       JSXOpeningElement(node) {
//         if (isButtonElement(node)) {
//           if (buttonStack.length > 0) {
//             context.report({
//               node,
//               messageId: "noNestedButtons",
//               data: {
//                 parent: buttonStack[buttonStack.length - 1],
//                 child: getComponentName(node.name),
//               },
//             });
//           }
//           buttonStack.push(getComponentName(node.name));
//         }
//       },

//       JSXClosingElement(node) {
//         if (isButtonElement(node)) {
//           buttonStack.pop();
//         }
//       },
//     };
//   },
// };
// export default rule;
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/types";
import type { TSESLint } from "@typescript-eslint/utils";

const rule: TSESLint.RuleModule<"noNestedButtons"> = {
  meta: {
    type: "problem",
    docs: {
      description: "Prevent nesting button elements",
    },
    messages: {
      noNestedButtons:
        "Nested buttons are not allowed. Found {{ parent }} > {{ child }}.",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function isButtonElement(node: TSESTree.JSXOpeningElement): boolean {
      const { name } = node;
      if (name.type === "JSXIdentifier") {
        return name.name.toLowerCase().endsWith("button");
      }
      if (name.type === "JSXMemberExpression") {
        const { property } = name;
        return (
          property.type === "JSXIdentifier" &&
          property.name.toLowerCase().endsWith("button")
        );
      }
      return false;
    }

    function getComponentName(name: TSESTree.JSXTagNameExpression): string {
      if (name.type === "JSXIdentifier") {
        return name.name;
      }
      if (name.type === "JSXMemberExpression") {
        return `${getComponentName(name.object)}.${getComponentName(name.property)}`;
      }
      return "";
    }

    return {
      JSXOpeningElement(node) {
        if (!isButtonElement(node)) {
          return;
        }

        // Check if any parent is a button
        let parent = context.getAncestors().pop();
        while (parent && parent.type !== AST_NODE_TYPES.Program) {
          if (
            parent.type === AST_NODE_TYPES.JSXElement &&
            parent.openingElement &&
            isButtonElement(parent.openingElement)
          ) {
            context.report({
              node,
              messageId: "noNestedButtons",
              data: {
                parent: getComponentName(parent.openingElement.name),
                child: getComponentName(node.name),
              },
            });
            break;
          }
          ({ parent } = parent);
        }
      },
    };
  },
};

export default rule;
