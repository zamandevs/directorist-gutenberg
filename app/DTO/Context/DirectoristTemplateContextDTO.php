<?php

namespace DirectoristGutenberg\App\DTO\Context;

defined( "ABSPATH" ) || exit;

use DirectoristGutenberg\WpMVC\DTO\DTO;

class DirectoristTemplateContextDTO extends DTO {
    private string $surface = 'page';
    private string $template_kind = 'custom';
    private string $context_mode = 'manual';
    private ?int $directory_type_id = null;
    private ?int $listing_id = null;
    private ?string $view = null;
    private string $instance_id = '';

    public function get_surface(): string {
        return $this->surface;
    }

    public function set_surface( string $surface ): self {
        $this->surface = $surface;
        return $this;
    }

    public function get_template_kind(): string {
        return $this->template_kind;
    }

    public function set_template_kind( string $template_kind ): self {
        $this->template_kind = $template_kind;
        return $this;
    }

    public function get_context_mode(): string {
        return $this->context_mode;
    }

    public function set_context_mode( string $context_mode ): self {
        $this->context_mode = $context_mode;
        return $this;
    }

    public function get_directory_type_id(): ?int {
        return $this->directory_type_id;
    }

    public function set_directory_type_id( ?int $directory_type_id ): self {
        $this->directory_type_id = $directory_type_id;
        return $this;
    }

    public function get_listing_id(): ?int {
        return $this->listing_id;
    }

    public function set_listing_id( ?int $listing_id ): self {
        $this->listing_id = $listing_id;
        return $this;
    }

    public function get_view(): ?string {
        return $this->view;
    }

    public function set_view( ?string $view ): self {
        $this->view = $view;
        return $this;
    }

    public function get_instance_id(): string {
        return $this->instance_id;
    }

    public function set_instance_id( string $instance_id ): self {
        $this->instance_id = $instance_id;
        return $this;
    }

    public function to_array(): array {
        return [
            'surface'           => $this->surface,
            'template_kind'     => $this->template_kind,
            'context_mode'      => $this->context_mode,
            'directory_type_id' => $this->directory_type_id,
            'listing_id'        => $this->listing_id,
            'view'              => $this->view,
            'instance_id'       => $this->instance_id,
        ];
    }
}
