"use client";
import { useCreate, useGetById, usePatchV2 } from "@/api";
import FormSubmitButtons from "@/components/form-submit-buttons";
import { SubmitType, Template } from "@/types";
import {
  Form,
  Input,
  Select,
  Divider,
  Row,
  Col,
  Card,
  Space,
  Button,
  Checkbox,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  ENDPOINT,
  PAGE_TITLE,
  QUERY_KEY,
  TEMPLATE_TYPES,
  ENTITY_TYPES,
  ENTITY_HANDLEBARS,
  TRANSACTION_POINTS,
  TransactionPoint,
} from "./constants";
import { useParams, useRouter } from "next/navigation";
import toast from "@/utils/toast";
import dynamic from "next/dynamic";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Node } from "@tiptap/core";
import { parse as parseHtml } from "node-html-parser";

// Add custom styles for the editor
const editorStyles = `
  .rich-text-editor {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
  }
  
  .editor-toolbar {
    background-color: #fafafa;
    border-bottom: 1px solid #d9d9d9;
  }
  
  .editor-content-container {
    min-height: 200px;
    padding: 16px;
    background-color: white;
  }
  
  .ProseMirror:focus {
    outline: none;
  }
  
  .variable {
    background-color: rgba(0, 122, 255, 0.1);
    border-radius: 4px;
    padding: 2px 4px;
    font-family: monospace;
    border: 1px dashed #0070f3;
    color: #0070f3;
    cursor: default;
    user-select: all;
  }
`;

const { Option } = Select;

// TipTap toolbar component with proper typing
const EditorToolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <div className="flex flex-wrap gap-1 p-2 border-b">
        <Button
          type={editor.isActive("bold") ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleBold().run()}
          size="small"
        >
          Bold
        </Button>
        <Button
          type={editor.isActive("italic") ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          size="small"
        >
          Italic
        </Button>
        <Button
          type={editor.isActive("underline") ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          size="small"
        >
          Underline
        </Button>
        <Select
          size="small"
          style={{ width: 120 }}
          defaultValue="normal"
          onChange={(value) =>
            editor.chain().focus().setFontFamily(value).run()
          }
        >
          <Option value="Arial">Arial</Option>
          <Option value="Georgia">Georgia</Option>
          <Option value="Inter">Inter</Option>
          <Option value="monospace">Monospace</Option>
        </Select>
        <Select
          size="small"
          style={{ width: 150 }}
          defaultValue=""
          onChange={(value) => editor.chain().focus().setTextAlign(value).run()}
        >
          <Option value="left">Align Left</Option>
          <Option value="center">Align Center</Option>
          <Option value="right">Align Right</Option>
          <Option value="justify">Justify</Option>
        </Select>
        <Select
          size="small"
          style={{ width: 120 }}
          defaultValue=""
          onChange={(value) => {
            if (value) {
              editor.chain().focus().setColor(value).run();
            }
          }}
        >
          <Option value="#000000">Black</Option>
          <Option value="#0000FF">Blue</Option>
          <Option value="#FF0000">Red</Option>
          <Option value="#008000">Green</Option>
        </Select>
        <Button
          type={editor.isActive("bulletList") ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          size="small"
        >
          Bullet List
        </Button>
        <Button
          type={editor.isActive("orderedList") ? "primary" : "default"}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          size="small"
        >
          Numbered List
        </Button>
        <Button
          onClick={() => {
            const url = window.prompt("URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          size="small"
        >
          Link
        </Button>
        <Button
          onClick={() => editor.chain().focus().undo().run()}
          size="small"
        >
          Undo
        </Button>
        <Button
          onClick={() => editor.chain().focus().redo().run()}
          size="small"
        >
          Redo
        </Button>
      </div>
    </div>
  );
};

// Custom extension for handling variables
const Variable = Node.create({
  name: "variable",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addAttributes() {
    return {
      value: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-variable]",
        getAttrs: (element) => {
          if (typeof element === "string") return {};
          // TypeScript safety: Check if element is an HTMLElement
          const htmlElement = element as HTMLElement;
          return {
            value: htmlElement.getAttribute("data-variable"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      {
        "data-variable": HTMLAttributes.value,
        class: "variable",
        style:
          "background-color: rgba(0, 0, 255, 0.1); padding: 2px 4px; border-radius: 4px;",
      },
      HTMLAttributes.value,
    ];
  },
});

export default function CreateForm(props: {
  submitType?: SubmitType;
  id?: number;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const router = useRouter();
  const { tenantId } = useParams();
  const { submitType = "create", id, setIsModalOpen } = props;
  const [form] = Form.useForm();
  const [submitLoader, setSubmitLoader] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<string>();
  const [selectedType, setSelectedType] = useState<string>();
  const [transactionPoints, setTransactionPoints] = useState<
    TransactionPoint[]
  >([]);
  const [smsContent, setSmsContent] = useState("");

  // Initialize TipTap editor with proper typing
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Write your template content here...",
      }),
      Variable,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none w-full min-h-[150px]",
      },
    },
  });

  const handleEntityChange = (value: string) => {
    setSelectedEntity(value);
    form.setFieldsValue({ entity: value });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    form.setFieldsValue({ type: value });
  };

  const insertVariable = useCallback(
    (variable: string) => {
      if (selectedType === "SMS") {
        setSmsContent((prev) => prev + variable);
      } else if (editor) {
        // Insert variable into TipTap editor
        editor
          .chain()
          .focus()
          .insertContent({
            type: "variable",
            attrs: { value: variable },
          })
          .run();
      }
    },
    [editor, selectedType]
  );

  const { mutate: createTemplate } = useCreate(`${tenantId}/${ENDPOINT}`, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const { mutate: updateTemplate } = usePatchV2(`${tenantId}/${ENDPOINT}`, id, [
    `${tenantId}/${QUERY_KEY}`,
  ]);

  const {
    status: templateStatus,
    data: template,
    error: templateError,
  } = useGetById<Template>(`${tenantId}/${ENDPOINT}`, id);

  useEffect(() => {
    if (submitType === "update" && templateStatus === "success" && template) {
      form.setFieldsValue(template);
      setSelectedType(template.type);

      if (template.type === "SMS") {
        setSmsContent(template.content || "");
      } else if (editor && template.content) {
        // Parse HTML content to replace variables with our custom format
        const processedContent = processTemplateContent(template.content);
        editor.commands.setContent(processedContent);
      }
    }
  }, [submitType, templateStatus, template, form, editor]);

  // Process HTML content to convert handlebar variables to our format
  const processTemplateContent = (htmlContent: string) => {
    try {
      // Use regex to replace handlebars with our custom spans
      return htmlContent.replace(/\{\{([^}]+)\}\}/g, (match) => {
        return `<span data-variable="${match}" class="variable">${match}</span>`;
      });
    } catch (error) {
      console.error("Error processing template content:", error);
      return htmlContent; // Return original content on error
    }
  };

  // Convert editor content to HTML, preserving handlebar variables
  const getEditorContent = () => {
    if (!editor) return "";

    try {
      // Get HTML from editor
      let html = editor.getHTML();

      // Parse the HTML to ensure our data-variable attributes are preserved
      const parsedHtml = parseHtml(html);

      // Find all variable spans and ensure they're properly formatted
      const variableSpans = parsedHtml.querySelectorAll("span[data-variable]");
      variableSpans.forEach((span) => {
        const variableValue = span.getAttribute("data-variable");
        // Ensure the content is the raw variable
        if (variableValue && span.textContent !== variableValue) {
          span.textContent = variableValue;
        }
      });

      return parsedHtml.toString();
    } catch (error) {
      console.error("Error processing editor content:", error);
      return editor.getHTML(); // Fallback to raw HTML
    }
  };

  useEffect(() => {
    const entity = selectedEntity || template?.entity;
    if (entity) {
      const points = TRANSACTION_POINTS[entity]
        ? [...TRANSACTION_POINTS[entity]]
        : [];
      setTransactionPoints(points);
      if (!selectedEntity && submitType === "update") {
        form.setFieldsValue({ transactionPoint: template?.transactionPoint });
      } else {
        form.setFieldsValue({ transactionPoint: undefined });
      }
    }
  }, [selectedEntity, form, template, submitType]);

  const onReset = () => {
    form.resetFields();
    if (editor) {
      editor.commands.clearContent();
    }
    setSmsContent("");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  function onFinish(values: any) {
    setSubmitLoader(true);

    const content = selectedType === "SMS" ? smsContent : getEditorContent();

    const submitTypeMessage = submitType === "create" ? "created" : "updated";
    const payload = {
      ...values,
      content: content,
      description: values.description ? values.description : "",
    };

    if (submitType === "create") {
      createTemplate(payload, {
        onSuccess: (response: any) => {
          setSubmitLoader(false);
          setIsModalOpen(false);
          toast({
            type: "success",
            response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
          });
          form.resetFields();
          if (editor) {
            editor.commands.clearContent();
          }
          setSmsContent("");
          router.push(`templates/${response.id}`);
        },
        onError(error) {
          toast({ type: "error", response: error });
          setSubmitLoader(false);
        },
      });
    } else {
      console.log(payload);
      updateTemplate(
        { id, ...payload },
        {
          onSuccess: () => {
            setSubmitLoader(false);
            setIsModalOpen(false);
            toast({
              type: "success",
              response: `${PAGE_TITLE} ${submitTypeMessage} successfully.`,
            });
          },
          onError(error) {
            toast({ type: "error", response: error });
            setSubmitLoader(false);
          },
        }
      );
    }
  }

  const isSmsType = selectedType === "SMS";

  return (
    <>
      {/* Include editor styles */}
      <style jsx global>
        {editorStyles}
      </style>

      <Form
        layout="vertical"
        form={form}
        name={submitType === "create" ? submitType : `${submitType}${id}`}
        onFinish={onFinish}
      >
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item
              name="name"
              label="Template Name"
              rules={[
                { required: true, message: "Template name is required!" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="type"
              label="Type"
              rules={[{ required: true, message: "Type is required!" }]}
            >
              <Select placeholder="Select type" onChange={handleTypeChange}>
                {TEMPLATE_TYPES.map((type) => (
                  <Option key={type.value} value={type.value}>
                    {type.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              name="entity"
              label="Entity"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select entity" onChange={handleEntityChange}>
                {ENTITY_TYPES.map((entity) => (
                  <Option key={entity.value} value={entity.value}>
                    {entity.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={6}>
            <Form.Item
              name="transactionPoint"
              label="Transaction Point"
              rules={[{ required: true }]}
            >
              <Select
                placeholder="Select when this triggers"
                disabled={!selectedEntity && submitType !== "update"}
              >
                {transactionPoints.map((point) => (
                  <Option key={point.value} value={point.value}>
                    {point.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>

        <Divider />

        {selectedEntity || submitType === "update" ? (
          <Card title="Available Fields" style={{ marginBottom: 16 }}>
            <Space wrap>
              {ENTITY_HANDLEBARS[
                (selectedEntity ||
                  template?.entity) as keyof typeof ENTITY_HANDLEBARS
              ]?.map((field) => (
                <Button
                  key={field.value}
                  onClick={() => insertVariable(field.value)}
                  type="dashed"
                >
                  {field.label}
                </Button>
              ))}
            </Space>
          </Card>
        ) : null}

        <Card title="Template Content">
          {isSmsType ? (
            <Input.TextArea
              rows={4}
              value={smsContent}
              onChange={(e) => setSmsContent(e.target.value)}
              placeholder="Enter SMS content (max 160 characters)"
              maxLength={160}
              showCount
            />
          ) : (
            <div className="rich-text-editor">
              <EditorToolbar editor={editor} />
              <div className="editor-content-container p-2 border min-h-[200px]">
                <EditorContent editor={editor} className="min-h-[200px]" />
              </div>
            </div>
          )}
        </Card>

        <Form.Item
          name="isActive"
          className="col-span-3 flex justify-start items-baseline"
          valuePropName="checked"
          label={" "}
        >
          <Checkbox>Active</Checkbox>
        </Form.Item>

        <div style={{ marginTop: 24 }}>
          <FormSubmitButtons
            submitLoader={submitLoader}
            onReset={onReset}
            handleCancel={handleCancel}
            cancelText="Cancel"
          />
        </div>
      </Form>
    </>
  );
}
