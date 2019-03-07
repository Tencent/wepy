export function patchExternalClasses (output, externalClasses) {
    if (!externalClasses) {
        externalClasses = {};
    }
    output.externalClasses = externalClasses;
  }
    